from fastapi import FastAPI, Depends
from auth.auth_routes import router as auth_router
from auth.auth_service import get_current_user

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Hello, world! This route does not need a token."}
