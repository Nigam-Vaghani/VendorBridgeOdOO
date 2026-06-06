import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # Import all models to ensure they are registered with Base.metadata
from routers import auth, vendor_routes, procurement_routes

app = FastAPI(title="VendorBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ok

app.include_router(auth.router)
app.include_router(vendor_routes.router)
app.include_router(procurement_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to VendorBridge API"}
