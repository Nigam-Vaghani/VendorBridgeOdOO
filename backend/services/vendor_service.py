import csv
import io
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, desc, asc
from models.vendor import Vendor
from models.vendor_document import VendorDocument
from models.user import User
from models.activity_log import ActivityLog
from models.purchase_order import PurchaseOrder
from core.enums import VendorStatus, RoleEnum
from schemas.vendor import VendorCreate, VendorUpdate, VendorPerformance, VendorPerformanceMonth, VendorPerformanceOrder
from fastapi import HTTPException, status, UploadFile
import math
from datetime import datetime

class VendorService:
    @staticmethod
    def get_vendors(
        db: Session,
        current_user: User,
        q: Optional[str] = None,
        category: Optional[str] = None,
        status_filter: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ):
        query = db.query(Vendor)

        # RBAC: Vendors only see themselves
        if current_user.role == RoleEnum.vendor:
            if not current_user.vendor_id:
                return [], 0
            query = query.filter(Vendor.id == current_user.vendor_id)

        # Fuzzy search
        if q:
            search = f"%{q}%"
            query = query.filter(
                or_(
                    Vendor.name.ilike(search),
                    Vendor.email.ilike(search),
                    Vendor.contact_person.ilike(search),
                    Vendor.gst_number.ilike(search)
                )
            )

        # Filters
        if category:
            query = query.filter(Vendor.category == category)
        if status_filter:
            query = query.filter(Vendor.status == status_filter)

        # Sorting
        sort_attr = getattr(Vendor, sort_by, Vendor.created_at)
        if sort_order == "desc":
            query = query.order_by(desc(sort_attr))
        else:
            query = query.order_by(asc(sort_attr))

        total = query.count()
        pages = math.ceil(total / limit)
        offset = (page - 1) * limit
        vendors = query.offset(offset).limit(limit).all()

        return vendors, total, pages

    @staticmethod
    def get_vendor_by_id(db: Session, vendor_id: UUID, current_user: User):
        # RBAC
        if current_user.role == RoleEnum.vendor and current_user.vendor_id != vendor_id:
            raise HTTPException(status_code=403, detail="Forbidden: You can only access your own vendor profile.")

        vendor = db.query(Vendor).options(joinedload(Vendor.documents)).filter(Vendor.id == vendor_id).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Add uploaded_by_name to documents
        for doc in vendor.documents:
            user = db.query(User).filter(User.id == doc.uploaded_by).first()
            doc.uploaded_by_name = f"{user.first_name} {user.last_name}" if user else "Unknown"

        return vendor

    @staticmethod
    def create_vendor(db: Session, vendor_data: VendorCreate, current_user: User):
        # Uniqueness checks
        if vendor_data.gst_number:
            if db.query(Vendor).filter(Vendor.gst_number == vendor_data.gst_number).first():
                raise HTTPException(status_code=409, detail="GST Number already exists")
        
        if vendor_data.pan_number:
            if db.query(Vendor).filter(Vendor.pan_number == vendor_data.pan_number).first():
                raise HTTPException(status_code=409, detail="PAN Number already exists")

        new_vendor = Vendor(
            **vendor_data.model_dump(),
            registered_by=current_user.id
        )
        db.add(new_vendor)
        db.commit()
        db.refresh(new_vendor)

        # Log Activity
        log = ActivityLog(
            user_id=current_user.id,
            action="created_vendor",
            entity_type="vendor",
            entity_id=new_vendor.id,
            details={"name": new_vendor.name}
        )
        db.add(log)
        db.commit()

        return new_vendor

    @staticmethod
    def update_vendor(db: Session, vendor_id: UUID, vendor_data: VendorUpdate, current_user: User):
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")

        update_data = vendor_data.model_dump(exclude_unset=True)
        
        # Uniqueness checks for GST/PAN
        if "gst_number" in update_data and update_data["gst_number"]:
            if db.query(Vendor).filter(Vendor.gst_number == update_data["gst_number"], Vendor.id != vendor_id).first():
                raise HTTPException(status_code=409, detail="GST Number already exists")
        
        if "pan_number" in update_data and update_data["pan_number"]:
            if db.query(Vendor).filter(Vendor.pan_number == update_data["pan_number"], Vendor.id != vendor_id).first():
                raise HTTPException(status_code=409, detail="PAN Number already exists")

        for key, value in update_data.items():
            setattr(vendor, key, value)

        db.commit()
        db.refresh(vendor)

        # Log Activity
        log = ActivityLog(
            user_id=current_user.id,
            action="updated_vendor",
            entity_type="vendor",
            entity_id=vendor.id,
            details={"changed_fields": list(update_data.keys())}
        )
        db.add(log)
        db.commit()

        return vendor

    @staticmethod
    def delete_vendor(db: Session, vendor_id: UUID, hard: bool, current_user: User):
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")

        if hard:
            # Check for references (PurchaseOrders, RFQs, etc.)
            # For brevity, checking POs
            po_count = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).count()
            if po_count > 0:
                raise HTTPException(status_code=400, detail="Cannot hard delete vendor with existing purchase orders. Use soft delete instead.")
            
            db.delete(vendor)
            message = "Vendor deleted permanently"
        else:
            vendor.status = VendorStatus.inactive
            message = "Vendor deactivated successfully"

        db.commit()

        # Log Activity
        log = ActivityLog(
            user_id=current_user.id,
            action="deleted_vendor" if hard else "deactivated_vendor",
            entity_type="vendor",
            entity_id=vendor_id,
            details={"hard": hard}
        )
        db.add(log)
        db.commit()

        return message

    @staticmethod
    def get_performance(db: Session, vendor_id: UUID, current_user: User):
        vendor = VendorService.get_vendor_by_id(db, vendor_id, current_user)
        
        # Calculate stats
        pos = db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id).all()
        total_spend = sum(po.total_amount for po in pos) if pos else 0.0
        avg_order_value = total_spend / len(pos) if pos else 0.0
        
        # Simplified recent orders
        recent_orders = [
            VendorPerformanceOrder(
                po_id=po.id,
                po_number=po.po_number,
                amount=po.total_amount,
                status=po.status,
                created_at=po.created_at
            ) for po in pos[-5:]
        ]

        # Placeholder for monthly metrics and response rates
        # In a real app, these would be complex group-by queries
        return VendorPerformance(
            vendor_id=vendor.id,
            vendor_name=vendor.name,
            rating=vendor.rating,
            total_orders=vendor.total_orders,
            on_time_delivery_pct=vendor.on_time_delivery_pct,
            total_spend=total_spend,
            average_order_value=avg_order_value,
            orders_by_month=[], # TBD
            rfq_response_rate=0.0, # TBD
            quotation_acceptance_rate=0.0, # TBD
            recent_orders=recent_orders
        )
