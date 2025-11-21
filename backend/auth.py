from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from pymongo import MongoClient
from jose import jwt
from datetime import datetime, timedelta
import os
from fastapi import Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["nocode_ml"]     
users = db["users"]          

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register")
def register_user(data: RegisterModel):
    if users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = pwd_context.hash(data.password)

    new_user = {
        "name": data.name,
        "email": data.email,
        "password": hashed_pw,
    }

    users.insert_one(new_user)

    return {"message": "User registered successfully"}

class LoginModel(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
def login_user(data: LoginModel):
    user = users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token({
        "id": str(user["_id"]),
        "email": user["email"]
    })

    response = JSONResponse({
        "message": "Login successful",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    })

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,    
        samesite="none",
        max_age=3600,
        path="/"
    )

    return response

@router.get("/auth/status")
def auth_status(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"status": "authenticated"}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/logout")
def logout():
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie("access_token")
    return response
