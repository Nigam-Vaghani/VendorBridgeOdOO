from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text


def generate_rfq_number(db: Session) -> str:
    """
    Generate a unique RFQ number in the format RFQ-YYYY-NNNN.
    Uses a DB sequence approach: count existing RFQs for this year and increment.
    """
    year = datetime.utcnow().year
    result = db.execute(
        text("SELECT COUNT(*) FROM rfqs WHERE rfq_number LIKE :prefix"),
        {"prefix": f"RFQ-{year}-%"}
    ).scalar()
    next_num = int(result) + 1
    return f"RFQ-{year}-{next_num:04d}"
