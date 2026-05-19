from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import uuid4
from datetime import datetime, timezone

from src.db.database import get_db
from src.api.deps import get_current_user
from src.db.models import User, Ingredient as IngredientModel
from src.schemas.ingredients import IngredientCreate, IngredientUpdate
from src.schemas.checkins import IngredientPublic

router = APIRouter(tags=['ingredients'])

@router.get('/ingredients', response_model=list[IngredientPublic])
async def list_ingredients(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(IngredientModel)
        .where(IngredientModel.user_id == current_user.id)
        .order_by(IngredientModel.created_at.desc())
    )
    return [IngredientPublic.model_validate(r) for r in rows.all()]


@router.post('/ingredients', response_model=IngredientPublic)
async def create_ingredient(
    body: IngredientCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.started_at > datetime.now(timezone.utc).date():
        raise HTTPException(status_code=400, detail="started_at cannot be in the future.")

    new_ingredient = IngredientModel(
        id=str(uuid4()),
        user_id=current_user.id,
        name=body.name,
        concentration=body.concentration,
        frequency=body.frequency,
        started_at=body.started_at,
    )
    db.add(new_ingredient)
    await db.commit()
    await db.refresh(new_ingredient)
    return IngredientPublic.model_validate(new_ingredient)


@router.patch('/ingredients/{ingredient_id}', response_model=IngredientPublic)
async def update_ingredient(
    ingredient_id: str,
    body: IngredientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row = await db.scalar(
        select(IngredientModel)
        .where(IngredientModel.id == ingredient_id, IngredientModel.user_id == current_user.id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Ingredient not found.")

    if body.name is not None:
        row.name = body.name
    if body.concentration is not None:
        row.concentration = body.concentration
    if body.frequency is not None:
        row.frequency = body.frequency
    if body.started_at is not None:
        if body.started_at > datetime.now(timezone.utc).date():
            raise HTTPException(status_code=400, detail="started_at cannot be in the future.")
        row.started_at = body.started_at

    await db.commit()
    await db.refresh(row)
    return IngredientPublic.model_validate(row)


@router.post('/ingredients/{ingredient_id}/discontinue', response_model=IngredientPublic)
async def discontinue_ingredient(
    ingredient_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row = await db.scalar(
        select(IngredientModel)
        .where(IngredientModel.id == ingredient_id, IngredientModel.user_id == current_user.id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Ingredient not found.")
    if row.discontinued_at is not None:
        raise HTTPException(status_code=409, detail="Ingredient already discontinued.")

    row.discontinued_at = datetime.now(timezone.utc).date()
    await db.commit()
    await db.refresh(row)
    return IngredientPublic.model_validate(row)


@router.delete('/ingredients/{ingredient_id}', status_code=204)
async def delete_ingredient(
    ingredient_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    row = await db.scalar(
        select(IngredientModel)
        .where(IngredientModel.id == ingredient_id, IngredientModel.user_id == current_user.id)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Ingredient not found.")

    await db.delete(row)
    await db.commit()
    return None
