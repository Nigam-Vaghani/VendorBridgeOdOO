import sys
import uuid
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User
from models.vendor import Vendor
from models.rfq import RFQ
from models.rfq_item import RFQItem
from models.rfq_vendor import RFQVendor
from models.quotation import Quotation
from models.approval_request import ApprovalRequest
from models.purchase_order import PurchaseOrder
from models.invoice import Invoice
from models.activity_log import ActivityLog
from core.enums import RFQStatus, QuotationStatus, ApprovalStatus, POStatus

def seed_data():
    db = SessionLocal()
    try:
        # Get standard users
        pofficer = db.query(User).filter(User.role == 'procurement_officer').first()
        manager = db.query(User).filter(User.role == 'manager').first()
        vendors = db.query(Vendor).all()
        
        if not all([pofficer, manager]) or not vendors:
            print("Missing base users or vendors. Run basic seed first.")
            return

        # Generate data for the past 6 months
        items_catalog = [
            ("Laptops", "Dell XPS 15", 1200.0),
            ("Monitors", "LG 27 inch 4K", 300.0),
            ("Desks", "Ergonomic Standing Desk", 450.0),
            ("Chairs", "Herman Miller Aeron", 800.0),
            ("Servers", "PowerEdge R740", 5000.0),
            ("Printers", "HP LaserJet Pro", 400.0)
        ]

        for i in range(25):
            days_ago = random.randint(5, 180)
            created_date = datetime.utcnow() - timedelta(days=days_ago)
            deadline_date = created_date + timedelta(days=15)
            
            # Determine status based on age
            if days_ago < 10:
                status = RFQStatus.sent
            else:
                status = RFQStatus.closed

            rfq_num = f"RFQ-HIST-{random.randint(1000, 9999)}"
            rfq = RFQ(
                rfq_number=rfq_num,
                title=f"Historical Procurement - Batch {i}",
                description="General procurement for Q" + str((created_date.month-1)//3 + 1),
                deadline=deadline_date,
                status=status,
                created_by=pofficer.id,
                created_at=created_date
            )
            db.add(rfq)
            db.flush()

            # Add Items
            num_items = random.randint(1, 4)
            for j in range(num_items):
                cat, name, price = random.choice(items_catalog)
                db.add(RFQItem(
                    rfq_id=rfq.id,
                    item_no=j+1,
                    product_name=name,
                    description=cat,
                    quantity=random.randint(5, 50),
                    unit="NOS"
                ))
            
            # Assign to 2 random vendors
            assigned_vendors = random.sample(vendors, min(2, len(vendors)))
            for v in assigned_vendors:
                db.add(RFQVendor(rfq_id=rfq.id, vendor_id=v.id, invite_sent=True, responded=(status==RFQStatus.closed)))
                
                # If closed, generate quotations
                if status == RFQStatus.closed:
                    total_amount = random.uniform(5000, 50000)
                    quote = Quotation(
                        rfq_id=rfq.id,
                        vendor_id=v.id,
                        total_amount=total_amount,
                        delivery_days=random.randint(7, 30),
                        validity_days=30,
                        status=QuotationStatus.accepted if v == assigned_vendors[0] else QuotationStatus.rejected,
                        submitted_by=manager.id, # Using manager id as a generic submitted_by for seed
                        submitted_at=deadline_date - timedelta(days=random.randint(1, 5))
                    )
                    db.add(quote)
                    db.flush()

                    if quote.status == QuotationStatus.accepted:
                        # Create PO
                        po = PurchaseOrder(
                            po_number=f"PO-HIST-{random.randint(1000, 9999)}",
                            quotation_id=quote.id,
                            vendor_id=v.id,
                            status=POStatus.completed if days_ago > 30 else POStatus.sent,
                            subtotal=total_amount * 0.85,
                            tax_rate=15.0,
                            tax_amount=total_amount * 0.15,
                            total_amount=total_amount,
                            created_by=manager.id,
                            created_at=quote.submitted_at + timedelta(days=2)
                        )
                        db.add(po)
                        db.flush()

                        # Create Invoice
                        if po.status == POStatus.completed or days_ago > 45:
                            inv = Invoice(
                                invoice_number=f"INV-HIST-{random.randint(1000, 9999)}",
                                po_id=po.id,
                                vendor_id=v.id,
                                subtotal=po.subtotal,
                                tax_amount=po.tax_amount,
                                total=po.total_amount,
                                status="paid" if days_ago > 60 else "draft",
                                due_date=po.created_at + timedelta(days=30),
                                created_by=manager.id,
                                created_at=po.created_at + timedelta(days=10)
                            )
                            db.add(inv)

        db.commit()
        print("Successfully seeded 6 months of historical data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
