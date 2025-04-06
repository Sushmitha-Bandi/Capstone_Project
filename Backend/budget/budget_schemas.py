from pydantic import BaseModel

class BudgetIn(BaseModel):
    amount: float

class BudgetOut(BaseModel):
    amount: float

    class Config:
        orm_mode = True
