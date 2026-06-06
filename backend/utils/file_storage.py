import os
import shutil
from fastapi import UploadFile
from datetime import datetime
from pathlib import Path

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "vendors")

def save_vendor_document(vendor_id: str, file: UploadFile) -> str:
    # Create vendor specific directory
    vendor_dir = os.path.join(UPLOAD_DIR, vendor_id)
    Path(vendor_dir).mkdir(parents=True, exist_ok=True)
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(vendor_dir, safe_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return relative path for URL
    return f"/uploads/vendors/{vendor_id}/{safe_filename}"

def delete_vendor_document(file_url: str):
    # Convert URL to local path
    # file_url is /uploads/vendors/{id}/{name}
    relative_path = file_url.lstrip("/")
    full_path = os.path.join(os.getcwd(), relative_path)
    if os.path.exists(full_path):
        os.remove(full_path)
