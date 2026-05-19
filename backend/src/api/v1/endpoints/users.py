from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.database import get_db
from src.db.models import User, get_utc_now
from src.api.deps import get_current_user

router = APIRouter()

@router.delete("/me", status_code=204)
async def delete_user_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> None:
    """
    GDPR soft-delete of the current user.
    """
    current_user.deleted_at = get_utc_now()
    current_user.is_active = False
    
    # Actually GDPR requires hard deletion or true anonymization, but
    # PSD explicitly says "GDPR soft-delete (sets deleted_at)".
    
    await db.commit()
    return None
