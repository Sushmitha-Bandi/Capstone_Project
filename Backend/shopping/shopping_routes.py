from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import ShoppingItem, User
from shopping.shopping_schemas import ShoppingItemCreate, ShoppingItemOut
from auth.auth_service import get_current_user
from database import get_db

router = APIRouter(
    prefix="/shopping-list",
    tags=["Shopping List"]
)

@router.post("/", response_model=ShoppingItemOut)
def add_item(
    item: ShoppingItemCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()

    new_item = ShoppingItem(
        item_name=item.item_name,
        quantity=item.quantity,
        user_id=user.id
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.get("/", response_model=list[ShoppingItemOut])
def get_items(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    return db.query(ShoppingItem).filter(ShoppingItem.user_id == user.id).all()


@router.delete("/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()

    item = db.query(ShoppingItem).filter(
        ShoppingItem.id == item_id,
        ShoppingItem.user_id == user.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    db.delete(item)
    db.commit()

    return {"message": "Item deleted"}

@router.put("/{item_id}", response_model=ShoppingItemOut)
def update_item(
    item_id: int,
    updated_item: ShoppingItemCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    item = db.query(ShoppingItem).filter(
        ShoppingItem.id == item_id,
        ShoppingItem.user_id == user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.item_name = updated_item.item_name
    item.quantity = updated_item.quantity
    db.commit()
    db.refresh(item)

    return item