from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, activity

app = FastAPI(title="VendorBridge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(activity.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to VendorBridge API"}
