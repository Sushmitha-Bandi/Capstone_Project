from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import ExpenseLog
from expenses.expense_schemas import ExpenseCreate, ExpenseOut

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

@router.post("/", response_model=ExpenseOut)
def log_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = ExpenseLog(
        item_name=expense.item_name,
        quantity=expense.quantity,
        price=expense.price,
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=list[ExpenseOut])
def get_expenses(db: Session = Depends(get_db)):
    return db.query(ExpenseLog).order_by(ExpenseLog.timestamp.desc()).all()
