from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from typing import Optional

class IngredientCreate(BaseModel):
    name: str = Field(..., min_length=1)
    concentration: str | None = None
    frequency: str
    started_at: date

class IngredientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    concentration: Optional[str] = None
    frequency: Optional[str] = None
    started_at: Optional[date] = None
