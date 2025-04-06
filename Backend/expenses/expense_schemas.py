from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExpenseCreate(BaseModel):
    item_name: str
    quantity: Optional[str] = None
    price: float

class ExpenseOut(BaseModel):
    id: int
    item_name: str
    quantity: Optional[str] = None
    price: float
    timestamp: datetime

    class Config:
        orm_mode = True
