
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    phone: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str
