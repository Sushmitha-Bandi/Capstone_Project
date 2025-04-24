from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth.auth_service import get_current_user
from models import Budget, User
from pydantic import BaseModel
from budget.budget_schemas import BudgetIn, BudgetOut

router = APIRouter(prefix="/budget", tags=["Budget"])

@router.get("/", response_model=BudgetOut)
def get_budget(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    budget = db.query(Budget).filter(Budget.user_id == user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="No budget found.")
    return budget

@router.put("/", response_model=BudgetOut)
def update_budget(
    data: BudgetIn,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    budget = db.query(Budget).filter(Budget.user_id == user.id).first()

    if not budget:
        budget = Budget(amount=data.amount, user_id=user.id)
        db.add(budget)
    else:
        budget.amount = data.amount

    db.commit()
    db.refresh(budget)
    return budget

@router.get("/check-threshold")
def check_budget_threshold(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    
    budget = db.query(Budget).filter(Budget.user_id == user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="No budget set")

    total_expenses = db.query(func.sum(ExpenseLog.price)).scalar() or 0

    if total_expenses > budget.amount:
        return {
            "status": "over",
            "message": "⚠️ You have exceeded your budget!",
            "spent": total_expenses,
            "budget": budget.amount
        }
    else:
        return {
            "status": "within",
            "message": "✅ You are within your budget.",
            "spent": total_expenses,
            "budget": budget.amount
        }