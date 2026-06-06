from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.auth import SignupRequest, LoginRequest, TokenResponse, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest
from models.user import User
from database import get_db
from services.auth_service import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from config import settings
from datetime import timedelta, datetime

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
        vendor_id=request.vendor_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user.last_login_at = datetime.now()
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}

@router.post("/refresh")
def refresh(request: RefreshTokenRequest):
    payload = decode_token(request.refresh_token, settings.JWT_REFRESH_SECRET_KEY)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token(data={"sub": email})
    return {"access_token": access_token}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return {"message": "If the email is registered, a reset link has been sent"}
    # Generate token
    token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(hours=1))
    # In a real app, send an email here
    print(f"Send password reset email to {user.email} with token: {token}")
    return {"message": "If the email is registered, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.token, settings.JWT_SECRET_KEY)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = hash_password(request.new_password)
    db.commit()
    return {"message": "Password has been reset successfully"}
