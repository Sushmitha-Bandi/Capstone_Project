from fastapi import FastAPI, Depends
from auth.auth_routes import router as auth_router
from auth.auth_service import get_current_user
from models import Base
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from shopping.shopping_routes import router as shopping_router
from budget.budget_routes import router as budget_router
from expenses.expense_routes import router as expense_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(shopping_router)
app.include_router(budget_router)
app.include_router(expense_router)


@app.get("/")
def read_root():
    return {"message": "Hello, world! This route does not need a token."}

@app.get("/protected")
def protected_route(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello {current_user}, you have access!"}
