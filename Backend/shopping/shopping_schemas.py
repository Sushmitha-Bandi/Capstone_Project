from pydantic import BaseModel
from typing import Optional

class ShoppingItemCreate(BaseModel):
    item_name: str
    quantity: Optional[str] = None

class ShoppingItemOut(BaseModel):
    id: int
    item_name: str
    quantity: Optional[str]

    class Config:
        orm_mode = True
