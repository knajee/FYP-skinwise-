from pydantic import BaseModel, EmailStr
from src.schemas.user import UserOut

class Token(BaseModel):
    token: str
    token_type: str
    user: UserOut

class TokenPayload(BaseModel):
    sub: str | None = None

class Login(BaseModel):
    email: EmailStr
    password: str
