from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.db.database import get_db
from src.db.models import User
from src.schemas.user import UserCreate, UserOut
from src.schemas.auth import Token, Login
from src.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)) -> Any:
    print(f"Register endpoint hit for {user_in.email}")
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # Create user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    token = create_access_token(user.id)
    return {"token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
async def login(login_data: Login, db: AsyncSession = Depends(get_db)) -> Any:
    # We accept JSON body {email, password} as defined in frontend PSD
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active or user.deleted_at is not None:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    token = create_access_token(user.id)
    return {"token": token, "token_type": "bearer", "user": user}
