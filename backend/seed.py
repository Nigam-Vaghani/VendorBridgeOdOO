import os
import sys
import uuid
from datetime import datetime

# Setup path so modules can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models.user import User
from models.vendor import Vendor
from models.rfq import RFQ
from models.rfq_item import RFQItem
from models.rfq_vendor import RFQVendor
from models.quotation import Quotation
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_db():
    print("Starting database seeding...")
    db = SessionLocal()
    try:
        # Create Vendors First
        vendors_data = [
            {"name": "Infra Supplies Pvt Ltd", "category": "Furniture", "gst_number": "22AAAAA0000A1Z5", "phone": "+91 9876543210", "status": "active", "email": "vendor@example.com", "contact_person": "Infra Contact"},
            {"name": "Tech Core Ltd", "category": "IT Equipment", "gst_number": "27BBBBB1111B1Z5", "phone": "+91 9123456780", "status": "active", "email": "tech@example.com", "contact_person": "Tech Contact"},
            {"name": "OfficeNeeds Co.", "category": "Stationery", "gst_number": "06CCCCC2222C1Z5", "phone": "+91 9988776655", "status": "pending", "email": "office@example.com", "contact_person": "Office Contact"},
            {"name": "Global Logistics", "category": "Transport", "gst_number": "07DDDDD3333D1Z5", "phone": "+91 8899001122", "status": "blocked", "email": "global@example.com", "contact_person": "Global Contact"},
        ]

        inserted_vendors = []
        for v_data in vendors_data:
            existing = db.query(Vendor).filter(Vendor.name == v_data["name"]).first()
            if not existing:
                new_vendor = Vendor(
                    id=uuid.uuid4(),
                    name=v_data["name"],
                    category=v_data["category"],
                    gst_number=v_data["gst_number"],
                    phone=v_data["phone"],
                    status=v_data["status"],
                    email=v_data["email"],
                    contact_person=v_data["contact_person"]
                )
                db.add(new_vendor)
                db.commit()
                db.refresh(new_vendor)
                inserted_vendors.append(new_vendor)
                print(f"Created vendor: {new_vendor.name}")
            else:
                inserted_vendors.append(existing)

        # Create a Vendor User
        vendor_user_email = "vendor@example.com"
        vendor_user = db.query(User).filter(User.email == vendor_user_email).first()
        if not vendor_user and len(inserted_vendors) > 0:
            hashed_password = hash_password("vendor123")
            vendor_user = User(
                id=uuid.uuid4(),
                email=vendor_user_email,
                name="Infra Supplies User",
                password_hash=hashed_password,
                role="vendor",
                vendor_id=inserted_vendors[0].id
            )
            db.add(vendor_user)
            db.commit()
            db.refresh(vendor_user)
            print("Created vendor user: vendor@example.com / vendor123")

        # Let's create a test RFQ if none exist
        existing_rfq = db.query(RFQ).first()
        if not existing_rfq and len(inserted_vendors) >= 2:
            admin_user = db.query(User).filter(User.role == "admin").first()
            admin_id = admin_user.id if admin_user else None
            
            rfq = RFQ(
                id=uuid.uuid4(),
                rfq_number="RFQ-TEST01",
                title="Office Furniture Procurement Q3",
                description="Need ergonomic chairs and tables for the new office wing.",
                deadline=datetime.utcnow(),
                terms="Net 30 days. Delivery to main warehouse.",
                status="sent",
                created_by=admin_id
            )
            db.add(rfq)
            db.commit()

            # Add Items
            items = [
                RFQItem(id=uuid.uuid4(), rfq_id=rfq.id, item_no="ITM-01", product_name="Ergonomic Chair", description="Mesh back, adjustable arms", quantity=50, unit="pcs"),
                RFQItem(id=uuid.uuid4(), rfq_id=rfq.id, item_no="ITM-02", product_name="Office Desk", description="120x60cm wooden desk", quantity=25, unit="pcs")
            ]
            db.add_all(items)
            
            # Send to vendors
            for vendor in inserted_vendors[:2]:
                rv = RFQVendor(rfq_id=rfq.id, vendor_id=vendor.id, invite_sent=True)
                db.add(rv)
            
            db.commit()
            print("Created sample RFQ with items.")

        print("Database seeding completed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
