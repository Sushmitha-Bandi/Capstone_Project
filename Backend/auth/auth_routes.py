from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from passlib.context import CryptContext

from .auth_schemas import UserLogin, Token
from .auth_service import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

fake_users_db = {
    "john": {"username": "john", "hashed_password": pwd_context.hash("secret123")},
}

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user:
        return None
    if not pwd_context.verify(password, user["hashed_password"]):
        return None
    return user

@router.post("/login", response_model=Token)
def login_for_access_token(data: UserLogin):
    user = authenticate_user(data.username, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
