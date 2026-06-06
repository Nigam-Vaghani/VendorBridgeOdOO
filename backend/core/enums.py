import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    procurement_officer = "procurement_officer"
    vendor = "vendor"
    manager = "manager"

class VendorStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    pending = "pending"
    blacklisted = "blacklisted"

class RFQStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    closed = "closed"
    cancelled = "cancelled"
    awarded = "awarded"

class QuotationStatus(str, enum.Enum):
    submitted = "submitted"
    under_review = "under_review"
    shortlisted = "shortlisted"
    rejected = "rejected"
    accepted = "accepted"
    withdrawn = "withdrawn"

class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    escalated = "escalated"

class ApprovalRequestType(str, enum.Enum):
    rfq = "rfq"
    quotation = "quotation"
    purchase_order = "purchase_order"

class POStatus(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    sent = "sent"
    acknowledged = "acknowledged"
    completed = "completed"
    cancelled = "cancelled"

class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    issued = "issued"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"

class NotificationType(str, enum.Enum):
    info = "info"
    success = "success"
    warning = "warning"
    error = "error"
    approval_request = "approval_request"
    approval_decision = "approval_decision"
    rfq_invite = "rfq_invite"
    quotation_received = "quotation_received"
    po_issued = "po_issued"
    invoice_issued = "invoice_issued"

class DocType(str, enum.Enum):
    gst_certificate = "gst_certificate"
    pan_card = "pan_card"
    registration_certificate = "registration_certificate"
    other = "other"
