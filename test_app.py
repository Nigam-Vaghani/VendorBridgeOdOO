import sys
import os
sys.path.append(os.path.abspath('backend'))
from database import SessionLocal
from models.approval_request import ApprovalRequest
from models.quotation import Quotation
from models.purchase_order import PurchaseOrder
import uuid

db = SessionLocal()
req = db.query(ApprovalRequest).first()
if req:
    print(f"Approving request {req.id}")
    q = db.query(Quotation).filter(Quotation.id == req.entity_id).first()
    if q:
        tax_rate = 18.00
        subtotal = float(q.total_amount) / (1 + (tax_rate/100))
        tax_amount = float(q.total_amount) - subtotal
        po_number = "PO-" + str(uuid.uuid4())[:8].upper()
        
        po = PurchaseOrder(
            po_number=po_number,
            quotation_id=q.id,
            vendor_id=q.vendor_id,
            status="draft",
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            total_amount=q.total_amount,
            created_by=req.requester_id
        )
        db.add(po)
        try:
            db.commit()
            print("Success")
        except Exception as e:
            print(f"Error: {e}")
            db.rollback()
else:
    print("No request found")
