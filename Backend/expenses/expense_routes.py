from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import ExpenseLog
from expenses.expense_schemas import ExpenseCreate, ExpenseOut
from sqlalchemy import func
from auth.auth_service import get_current_user, oauth2_scheme, verify_token

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

@router.get("/total", response_model=float)
def get_total_expenses(db: Session = Depends(get_db)):
    total = db.query(func.sum(ExpenseLog.price)).scalar() or 0.0
    return total 

@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    expense = db.query(ExpenseLog).filter(ExpenseLog.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return


