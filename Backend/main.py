from fastapi import FastAPI, Depends
from auth.auth_routes import router as auth_router
from auth.auth_service import get_current_user
from models import Base
from database import engine

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Hello, world! This route does not need a token."}

@app.get("/protected")
def protected_route(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello {current_user}, you have access!"}
