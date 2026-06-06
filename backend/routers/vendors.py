from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import csv
import io

from database import get_db
from dependencies import get_current_user, role_required
from models.user import User
from models.vendor import Vendor
from models.vendor_document import VendorDocument
from core.enums import RoleEnum, VendorStatus, DocType
from schemas.vendor import (
    VendorCreate, VendorUpdate, VendorResponse, 
    VendorPerformance, VendorPerformanceOrder, VendorImportResult,
    DocumentResponse, RFQListItem
)
from schemas.common import SuccessResponse, PaginatedResponse, PaginationResponse
from services.vendor_service import VendorService
from utils.file_storage import save_vendor_document, delete_vendor_document

router = APIRouter(prefix="/vendors", tags=["vendors"])

# Roles for write operations
WRITE_ROLES = [RoleEnum.admin.value, RoleEnum.manager.value, RoleEnum.procurement_officer.value]

@router.get("", response_model=PaginatedResponse[VendorResponse])
def list_vendors(
    q: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendors, total, pages = VendorService.get_vendors(
        db, current_user, q, category, status, page, limit, sort_by, sort_order
    )
    return {
        "success": True,
        "data": vendors,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": pages
        }
    }

@router.get("/{id}", response_model=SuccessResponse[VendorResponse])
def get_vendor(
    id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    vendor = VendorService.get_vendor_by_id(db, id, current_user)
    return {"success": True, "data": vendor}

@router.post("", response_model=SuccessResponse[VendorResponse], status_code=status.HTTP_201_CREATED)
def create_vendor(
    vendor_data: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    vendor = VendorService.create_vendor(db, vendor_data, current_user)
    return {"success": True, "data": vendor, "message": "Vendor created successfully"}

@router.put("/{id}", response_model=SuccessResponse[VendorResponse])
def update_vendor(
    id: UUID,
    vendor_data: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    vendor = VendorService.update_vendor(db, id, vendor_data, current_user)
    return {"success": True, "data": vendor, "message": "Vendor updated successfully"}

@router.delete("/{id}")
def delete_vendor(
    id: UUID,
    hard: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.admin.value]))
):
    message = VendorService.delete_vendor(db, id, hard, current_user)
    return {"success": True, "message": message}

@router.get("/{id}/performance", response_model=SuccessResponse[VendorPerformance])
def get_vendor_performance(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    performance = VendorService.get_performance(db, id, current_user)
    return {"success": True, "data": performance}

@router.get("/{id}/rfqs")
def list_vendor_rfqs(
    id: UUID,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # This is a placeholder since RFQ models are complex.
    # Implementation would follow the pattern of joining RFQVendors and RFQs
    return {"success": True, "data": [], "pagination": {"page": page, "limit": limit, "total": 0, "pages": 0}}

@router.post("/{id}/documents", response_model=SuccessResponse[DocumentResponse], status_code=status.HTTP_201_CREATED)
async def upload_document(
    id: UUID,
    doc_type: DocType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required(WRITE_ROLES))
):
    # Validate file
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, PNG allowed.")
    
    # Check file size (10MB limit)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")
    await file.seek(0)

    # Save file
    file_url = save_vendor_document(str(id), file)
    
    # Create DB record
    new_doc = VendorDocument(
        vendor_id=id,
        doc_type=doc_type,
        file_name=file.filename,
        file_url=file_url,
        uploaded_by=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return {"success": True, "data": new_doc, "message": "Document uploaded successfully"}

@router.get("/{id}/documents", response_model=SuccessResponse[List[DocumentResponse]])
def list_documents(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC
    if current_user.role == RoleEnum.vendor and current_user.vendor_id != id:
         raise HTTPException(status_code=403, detail="Forbidden")

    docs = db.query(VendorDocument).filter(VendorDocument.vendor_id == id).order_by(VendorDocument.created_at.desc()).all()
    # Populate uploader names
    for doc in docs:
        user = db.query(User).filter(User.id == doc.uploaded_by).first()
        doc.uploaded_by_name = f"{user.first_name} {user.last_name}" if user else "Unknown"

    return {"success": True, "data": docs}

@router.delete("/{id}/documents/{doc_id}")
def delete_document(
    id: UUID,
    doc_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.admin.value]))
):
    doc = db.query(VendorDocument).filter(VendorDocument.id == doc_id, VendorDocument.vendor_id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from storage
    delete_vendor_document(doc.file_url)
    
    # Delete from DB
    db.delete(doc)
    db.commit()
    
    return {"success": True, "message": "Document deleted successfully"}

@router.post("/import", response_model=SuccessResponse[VendorImportResult])
async def import_vendors(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required([RoleEnum.admin.value]))
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    
    content = await file.read()
    stream = io.StringIO(content.decode('utf-8'))
    reader = csv.DictReader(stream)
    
    results = {"total_rows": 0, "successful": 0, "failed": 0, "errors": []}
    
    for i, row in enumerate(reader, 1):
        results["total_rows"] += 1
        try:
            # Simple validation & uniqueness check in loop for MVP
            # In production, use bulk insert with validation
            if not row.get('name') or not row.get('email'):
                raise ValueError("Missing name or email")
            
            # Check for existing email/gst/pan
            if db.query(Vendor).filter(
                or_(
                    Vendor.email == row.get('email'),
                    Vendor.gst_number == row.get('gst_number') if row.get('gst_number') else False,
                    Vendor.pan_number == row.get('pan_number') if row.get('pan_number') else False
                )
            ).first():
                 raise ValueError("Duplicate vendor detected (Email/GST/PAN)")

            vendor = Vendor(
                name=row['name'],
                category=row.get('category', 'General'),
                gst_number=row.get('gst_number'),
                pan_number=row.get('pan_number'),
                contact_person=row.get('contact_person', row['name']),
                email=row['email'],
                phone=row.get('phone', ''),
                address_line1=row.get('address_line1'),
                city=row.get('city'),
                state=row.get('state'),
                pincode=row.get('pincode'),
                country=row.get('country', 'India'),
                registered_by=current_user.id
            )
            db.add(vendor)
            results["successful"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"row": i, "message": str(e)})
    
    db.commit()
    return {"success": True, "data": results, "message": f"Import completed with {results['successful']} successes"}
