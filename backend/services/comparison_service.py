import csv
import io
from decimal import Decimal
from typing import Optional, Dict
from datetime import datetime, timezone
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.quotation import Quotation
from models.quotation_item import QuotationItem
from models.rfq import RFQ
from models.rfq_item import RFQItem
from models.vendor import Vendor
from core.enums import QuotationStatus

try:
    from weasyprint import HTML
    import jinja2
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False


def _get_rfq_and_quotes(db: Session, rfq_id: str):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=404, detail="RFQ not found")

    quotes = db.query(Quotation).filter(
        Quotation.rfq_id == rfq_id,
        Quotation.status.in_([QuotationStatus.submitted, QuotationStatus.under_review, QuotationStatus.shortlisted, QuotationStatus.accepted])
    ).all()

    if not quotes:
        return rfq, [], {}

    vendors = {}
    for q in quotes:
        v = db.query(Vendor).filter(Vendor.id == q.vendor_id).first()
        vendors[q.vendor_id] = v

    return rfq, quotes, vendors


# ─── 1. MATRIX ─────────────────────────────────────────────────────────────────

def get_comparison_matrix(db: Session, rfq_id: str, include_items: bool = True):
    rfq, quotes, vendors = _get_rfq_and_quotes(db, rfq_id)
    if not quotes:
        return {
            "rfq_id": rfq.id,
            "rfq_number": rfq.rfq_number,
            "rfq_title": rfq.title,
            "rfq_deadline": rfq.deadline,
            "total_vendors": 0,
            "total_quotations": 0,
            "vendors": [],
            "item_comparison": [] if include_items else None,
            "summary": {}
        }

    # Summary calculations
    lowest_total = min((q.total_amount for q in quotes), default=None)
    fastest_delivery = min((q.delivery_days for q in quotes), default=None)
    highest_rating = max((vendors[q.vendor_id].rating for q in quotes), default=None)

    lowest_total_quote = next((q for q in quotes if q.total_amount == lowest_total), None)
    fastest_delivery_quote = next((q for q in quotes if q.delivery_days == fastest_delivery), None)
    highest_rating_vendor = next((v for v in vendors.values() if v.rating == highest_rating), None)

    avg_total = sum(q.total_amount for q in quotes) / len(quotes) if quotes else 0
    avg_delivery = sum(q.delivery_days for q in quotes) / len(quotes) if quotes else 0

    vendors_data = []
    for q in quotes:
        v = vendors[q.vendor_id]
        vendors_data.append({
            "vendor_id": q.vendor_id,
            "vendor_name": v.name,
            "vendor_rating": v.rating,
            "quotation_id": q.id,
            "total_amount": q.total_amount,
            "delivery_days": q.delivery_days,
            "validity_days": q.validity_days,
            "status": q.status,
            "submitted_at": q.submitted_at,
            "notes": q.notes,
            "is_lowest_total": q.total_amount == lowest_total,
            "is_fastest_delivery": q.delivery_days == fastest_delivery
        })

    # Sort vendors by total amount
    vendors_data.sort(key=lambda x: x["total_amount"])

    summary = {
        "lowest_total_amount": lowest_total,
        "lowest_total_vendor_id": lowest_total_quote.vendor_id if lowest_total_quote else None,
        "lowest_total_vendor_name": vendors[lowest_total_quote.vendor_id].name if lowest_total_quote else None,
        "fastest_delivery_days": fastest_delivery,
        "fastest_delivery_vendor_id": fastest_delivery_quote.vendor_id if fastest_delivery_quote else None,
        "fastest_delivery_vendor_name": vendors[fastest_delivery_quote.vendor_id].name if fastest_delivery_quote else None,
        "highest_rated_vendor_id": highest_rating_vendor.id if highest_rating_vendor else None,
        "highest_rated_vendor_name": highest_rating_vendor.name if highest_rating_vendor else None,
        "highest_rating": highest_rating,
        "average_total_amount": Decimal(round(avg_total, 2)),
        "average_delivery_days": Decimal(round(avg_delivery, 2))
    }

    item_comparison = None
    if include_items:
        item_comparison = []
        rfq_items = db.query(RFQItem).filter(RFQItem.rfq_id == rfq.id).order_by(RFQItem.item_no).all()
        for r_item in rfq_items:
            q_items = db.query(QuotationItem).join(Quotation).filter(
                QuotationItem.rfq_item_id == r_item.id,
                Quotation.id.in_([q.id for q in quotes])
            ).all()

            lowest_price = min((qi.unit_price for qi in q_items), default=None)

            vendor_quotes = []
            for qi in q_items:
                v_id = qi.quotation.vendor_id
                price_diff_amount = qi.unit_price - lowest_price if lowest_price else Decimal(0)
                price_diff_pct = (price_diff_amount / lowest_price * 100) if lowest_price and lowest_price > 0 else Decimal(0)
                
                vendor_quotes.append({
                    "vendor_id": v_id,
                    "vendor_name": vendors[v_id].name,
                    "unit_price": qi.unit_price,
                    "quantity": qi.quantity,
                    "line_total": qi.line_total,
                    "delivery_days": qi.delivery_days,
                    "is_lowest_price": qi.unit_price == lowest_price if lowest_price is not None else False,
                    "price_diff_pct": Decimal(round(price_diff_pct, 2)),
                    "price_diff_amount": Decimal(round(price_diff_amount, 2))
                })

            item_comparison.append({
                "rfq_item_id": r_item.id,
                "item_no": r_item.item_no,
                "product_name": r_item.product_name,
                "description": r_item.description,
                "rfq_quantity": r_item.quantity,
                "unit": r_item.unit,
                "estimated_unit_price": r_item.estimated_unit_price,
                "vendor_quotes": vendor_quotes
            })

    return {
        "rfq_id": rfq.id,
        "rfq_number": rfq.rfq_number,
        "rfq_title": rfq.title,
        "rfq_deadline": rfq.deadline,
        "total_vendors": len(quotes),
        "total_quotations": len(quotes),
        "vendors": vendors_data,
        "item_comparison": item_comparison,
        "summary": summary
    }


# ─── 2. TABLE ──────────────────────────────────────────────────────────────────

def get_comparison_table(db: Session, rfq_id: str):
    matrix = get_comparison_matrix(db, rfq_id, include_items=True)
    if not matrix["vendors"]:
        return {"rfq_id": matrix["rfq_id"], "rfq_number": matrix["rfq_number"], "columns": [], "rows": [], "item_rows": []}

    columns = [{"key": "parameter", "label": "Parameter"}]
    for v in matrix["vendors"]:
        columns.append({"key": str(v["vendor_id"]), "label": v["vendor_name"]})

    rows = []
    
    # Total Amount
    row = {"parameter": "Total Amount", "highlight": str(matrix["summary"]["lowest_total_vendor_id"])}
    for v in matrix["vendors"]: row[str(v["vendor_id"])] = float(v["total_amount"])
    rows.append(row)

    # Delivery Days
    row = {"parameter": "Delivery Days", "highlight": str(matrix["summary"]["fastest_delivery_vendor_id"])}
    for v in matrix["vendors"]: row[str(v["vendor_id"])] = v["delivery_days"]
    rows.append(row)

    # Vendor Rating
    row = {"parameter": "Vendor Rating", "highlight": str(matrix["summary"]["highest_rated_vendor_id"])}
    for v in matrix["vendors"]: row[str(v["vendor_id"])] = float(v["vendor_rating"])
    rows.append(row)

    # Validity Days
    row = {"parameter": "Validity Days", "highlight": None}
    for v in matrix["vendors"]: row[str(v["vendor_id"])] = v["validity_days"]
    rows.append(row)

    # Notes
    row = {"parameter": "Notes", "highlight": None}
    for v in matrix["vendors"]: row[str(v["vendor_id"])] = v["notes"] or ""
    rows.append(row)

    # Items
    item_rows = []
    for item in matrix["item_comparison"]:
        # Find who has lowest price for this item
        lowest_v_id = next((str(vq["vendor_id"]) for vq in item["vendor_quotes"] if vq["is_lowest_price"]), None)
        
        row = {
            "parameter": f"{item['product_name']} ({int(item['rfq_quantity'])} {item['unit']})",
            "highlight": lowest_v_id,
            "unit": f"per {item['unit']}"
        }
        for vq in item["vendor_quotes"]:
            row[str(vq["vendor_id"])] = float(vq["unit_price"])
        item_rows.append(row)

    return {
        "rfq_id": matrix["rfq_id"],
        "rfq_number": matrix["rfq_number"],
        "columns": columns,
        "rows": rows,
        "item_rows": item_rows
    }


# ─── 3. CHART ──────────────────────────────────────────────────────────────────

def get_comparison_chart(db: Session, rfq_id: str, chart_type: str = "bar"):
    rfq, quotes, vendors = _get_rfq_and_quotes(db, rfq_id)
    if not quotes:
        return {"chart_type": chart_type, "rfq_id": rfq_id, "datasets": []}

    datasets = []
    
    if chart_type == "bar":
        data_total = []
        data_delivery = []
        for q in quotes:
            v_name = vendors[q.vendor_id].name
            data_total.append({"vendor": v_name, "value": float(q.total_amount)})
            data_delivery.append({"vendor": v_name, "value": q.delivery_days})
            
        datasets.append({"label": "Total Amount", "data": data_total})
        datasets.append({"label": "Delivery Days", "data": data_delivery})

    elif chart_type == "radar":
        # Normalize to 0-100 where higher is better for rating, but lower is better for price/delivery
        max_price = max(float(q.total_amount) for q in quotes)
        max_del = max(q.delivery_days for q in quotes)
        
        data_price = []
        data_del = []
        data_rating = []
        
        for q in quotes:
            v_name = vendors[q.vendor_id].name
            rating = float(vendors[q.vendor_id].rating)
            
            # price score: 100 is best (0 price), 0 is worst (max_price)
            p_score = 100 - ((float(q.total_amount) / max_price) * 100) if max_price else 100
            # delivery score
            d_score = 100 - ((q.delivery_days / max_del) * 100) if max_del else 100
            # rating score (out of 5)
            r_score = (rating / 5.0) * 100
            
            data_price.append({"vendor": v_name, "value": p_score})
            data_del.append({"vendor": v_name, "value": d_score})
            data_rating.append({"vendor": v_name, "value": r_score})
            
        datasets.append({"label": "Price Value", "data": data_price})
        datasets.append({"label": "Delivery Speed", "data": data_del})
        datasets.append({"label": "Vendor Rating", "data": data_rating})

    elif chart_type == "pie":
        data_total = []
        for q in quotes:
            data_total.append({"vendor": vendors[q.vendor_id].name, "value": float(q.total_amount)})
        datasets.append({"label": "Total Amount", "data": data_total})

    return {
        "chart_type": chart_type,
        "rfq_id": rfq.id,
        "datasets": datasets
    }


# ─── 4. SCORING ────────────────────────────────────────────────────────────────

def get_comparison_scoring(db: Session, rfq_id: str, weights: dict):
    rfq, quotes, vendors = _get_rfq_and_quotes(db, rfq_id)
    if not quotes:
        return {"rfq_id": rfq_id, "weights": weights, "scores": [], "recommendation": None}

    w_price = Decimal(weights.get("price", 40))
    w_del = Decimal(weights.get("delivery", 30))
    w_qual = Decimal(weights.get("quality", 30))

    lowest_price = min(q.total_amount for q in quotes)
    fastest_del = min(q.delivery_days for q in quotes)
    
    scores_list = []
    
    for q in quotes:
        v = vendors[q.vendor_id]
        
        p_score = (lowest_price / q.total_amount) * w_price if q.total_amount > 0 else w_price
        d_score = (Decimal(fastest_del) / Decimal(q.delivery_days)) * w_del if q.delivery_days > 0 else w_del
        q_score = (v.rating / Decimal(5.0)) * w_qual
        
        total = p_score + d_score + q_score
        
        scores_list.append({
            "vendor_id": q.vendor_id,
            "vendor_name": v.name,
            "total_score": Decimal(round(total, 1)),
            "price_score": Decimal(round(p_score, 1)),
            "delivery_score": Decimal(round(d_score, 1)),
            "quality_score": Decimal(round(q_score, 1)),
            # Ranks calculated below
            "raw_price": q.total_amount,
            "raw_del": q.delivery_days,
            "raw_qual": v.rating
        })

    # Sort and rank
    scores_list.sort(key=lambda x: x["raw_price"])
    for i, s in enumerate(scores_list): s["price_rank"] = i + 1
    
    scores_list.sort(key=lambda x: x["raw_del"])
    for i, s in enumerate(scores_list): s["delivery_rank"] = i + 1
    
    scores_list.sort(key=lambda x: x["raw_qual"], reverse=True)
    for i, s in enumerate(scores_list): s["quality_rank"] = i + 1
    
    scores_list.sort(key=lambda x: x["total_score"], reverse=True)
    for i, s in enumerate(scores_list): s["rank"] = i + 1

    top = scores_list[0]
    reason = f"Highest total score ({top['total_score']})."
    if top["price_rank"] == 1: reason += " Best price."
    if top["delivery_rank"] == 1: reason += " Fastest delivery."
    if top["quality_rank"] == 1: reason += " Highest rated vendor."

    return {
        "rfq_id": rfq.id,
        "weights": {"price": float(w_price), "delivery": float(w_del), "quality": float(w_qual)},
        "scores": scores_list,
        "recommendation": {
            "vendor_id": top["vendor_id"],
            "vendor_name": top["vendor_name"],
            "reason": reason
        }
    }


# ─── 5. EXPORT ─────────────────────────────────────────────────────────────────

def export_comparison(db: Session, rfq_id: str, format_type: str):
    matrix = get_comparison_matrix(db, rfq_id, include_items=True)
    rfq_number = matrix["rfq_number"]
    filename = f"{rfq_number}_Comparison_Report.{format_type}"
    
    if format_type == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["RFQ Number", rfq_number, "Title", matrix["rfq_title"]])
        writer.writerow([])
        
        # Summary rows
        header = ["Vendor Name", "Total Amount", "Delivery Days", "Validity Days", "Rating", "Status"]
        writer.writerow(header)
        for v in matrix["vendors"]:
            writer.writerow([
                v["vendor_name"], v["total_amount"], v["delivery_days"], 
                v["validity_days"], v["vendor_rating"], v["status"]
            ])
            
        writer.writerow([])
        writer.writerow(["Line Items Comparison"])
        
        # Item comparison
        for item in matrix["item_comparison"]:
            writer.writerow([f"Item: {item['product_name']} (Qty: {item['rfq_quantity']} {item['unit']})"])
            item_header = ["Vendor", "Unit Price", "Line Total", "Delivery"]
            writer.writerow(item_header)
            for vq in item["vendor_quotes"]:
                writer.writerow([vq["vendor_name"], vq["unit_price"], vq["line_total"], vq["delivery_days"]])
            writer.writerow([])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]), 
            media_type="text/csv", 
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    elif format_type == "pdf":
        if not WEASYPRINT_AVAILABLE:
            raise HTTPException(status_code=500, detail="PDF export not available (WeasyPrint not installed/supported). Try CSV.")
            
        template = jinja2.Template("""
        <html>
        <head>
            <style>
                body { font-family: sans-serif; }
                h1 { color: #6322ef; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; }
                .lowest { background-color: #d1e7dd; color: #0f5132; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Quotation Comparison: {{ rfq_number }}</h1>
            <h2>Summary</h2>
            <table>
                <tr>
                    <th>Vendor</th>
                    <th>Total Amount</th>
                    <th>Delivery Days</th>
                    <th>Rating</th>
                </tr>
                {% for v in vendors %}
                <tr>
                    <td>{{ v.vendor_name }}</td>
                    <td class="{% if v.is_lowest_total %}lowest{% endif %}">{{ v.total_amount }}</td>
                    <td class="{% if v.is_fastest_delivery %}lowest{% endif %}">{{ v.delivery_days }}</td>
                    <td>{{ v.vendor_rating }}</td>
                </tr>
                {% end endfor %}
            </table>
            
            <h2>Line Items</h2>
            {% for item in items %}
                <h3>{{ item.product_name }} (Qty: {{ item.rfq_quantity }} {{ item.unit }})</h3>
                <table>
                    <tr>
                        <th>Vendor</th>
                        <th>Unit Price</th>
                        <th>Line Total</th>
                    </tr>
                    {% for q in item.vendor_quotes %}
                    <tr>
                        <td>{{ q.vendor_name }}</td>
                        <td class="{% if q.is_lowest_price %}lowest{% endif %}">{{ q.unit_price }}</td>
                        <td class="{% if q.is_lowest_price %}lowest{% endif %}">{{ q.line_total }}</td>
                    </tr>
                    {% endfor %}
                </table>
            {% endfor %}
        </body>
        </html>
        """)
        
        html_out = template.render(
            rfq_number=rfq_number,
            vendors=matrix["vendors"],
            items=matrix["item_comparison"]
        )
        
        pdf_bytes = HTML(string=html_out).write_pdf()
        return StreamingResponse(
            io.BytesIO(pdf_bytes), 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    raise HTTPException(status_code=400, detail="Invalid format")
