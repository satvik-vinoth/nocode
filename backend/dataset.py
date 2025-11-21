from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordBearer
from pymongo import MongoClient
from gridfs import GridFS
from jose import jwt
from datetime import datetime
import csv, io, os
from preprocessing.process_Dataset import process_dataset
from pydantic import BaseModel
from typing import List, Any
from fastapi import Cookie,Request



router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

client = MongoClient(MONGO_URL)
db = client["nocode_ml"]
fs = GridFS(db)
datasets = db["datasets"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["id"]   
    except:
        raise HTTPException(status_code=401, detail="Invalid token")



@router.get("/get/{dataset_id}")
def get_dataset(dataset_id: str):
    doc = datasets.find_one({"_id": ObjectId(dataset_id)})

    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")

    return {
        "dataset_id": dataset_id,
        "preview": doc["preview"],
    }

@router.get("/restore/{dataset_id}")
def restore_dataset(dataset_id: str):
    doc = datasets.find_one({"_id": ObjectId(dataset_id)})

    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")

    original_id = doc.get("original_file_id")

    if not original_id:
        raise HTTPException(status_code=400, detail="Original file missing")

    original_file = fs.get(original_id)
    original_bytes = original_file.read()

    new_latest_id = fs.put(
        original_bytes,
        filename=f"restored_{doc['name']}"
    )

    csv_text = original_bytes.decode("utf-8")
    reader = list(csv.reader(io.StringIO(csv_text)))
    preview = reader[:21]

    datasets.update_one(
        {"_id": ObjectId(dataset_id)},
        {"$set": {"latest_version_file_id": new_latest_id, "preview": preview}}
    )

    return {
        "dataset_id": dataset_id,
        "preview": preview
    }



def serialize_dataset(document):
    return {
        "id": str(document["_id"]),
        "columns": document["columns"],
        "preview": document["preview"],
        "total_rows": document["total_rows"]
    }

@router.post("/upload")
async def upload_dataset(
    request: Request,
    file: UploadFile = File(...)
):
    user_id = get_current_user(request)

    file_bytes = await file.read()
    csv_text = file_bytes.decode("utf-8")

    file_id = fs.put(io.BytesIO(file_bytes), filename=file.filename)

    latest_version_file_id = fs.put(io.BytesIO(file_bytes), filename=f"latest_{file.filename}")

    reader = list(csv.reader(io.StringIO(csv_text)))

    if not reader:
        raise HTTPException(status_code=400, detail="Empty CSV")

    header = reader[0]
    preview = reader[:21]

    doc = {
        "user_id": user_id,
        "name": file.filename,
        "original_file_id": file_id,
        "latest_version_file_id": latest_version_file_id,
        "rows": len(reader) - 1,
        "columns": header,
        "preview": preview,
        "uploaded_at": datetime.utcnow(),
        "status": "raw",
    }

    dataset_id = datasets.insert_one(doc).inserted_id

    return {
        "dataset_id": str(dataset_id),
        "preview": preview,
    }


@router.post("/clone/{sample_id}")
def clone_sample_dataset(sample_id: str, request: Request):

    user_id = get_current_user(request)

    doc = datasets.find_one({"_id": ObjectId(sample_id), "is_sample": True})

    if not doc:
        raise HTTPException(status_code=404, detail="Sample dataset not found")

    rows = doc["data"]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(rows)
    csv_text = output.getvalue().encode("utf-8")

    original_file_id = fs.put(csv_text, filename=f"{doc['name']}_original.csv")
    latest_version_file_id = fs.put(csv_text, filename=f"{doc['name']}_latest.csv")

    header = rows[0]
    preview = rows[:21]

    new_doc = {
        "user_id": user_id,
        "name": doc["name"],
        "original_file_id": original_file_id,
        "latest_version_file_id": latest_version_file_id,
        "rows": len(rows) - 1,
        "columns": header,
        "preview": preview,
        "uploaded_at": datetime.utcnow(),
        "status": "raw",
    }

    dataset_id = datasets.insert_one(new_doc).inserted_id

    return {
        "dataset_id": str(dataset_id),
        "preview": preview
    }



class DatasetProcessRequest(BaseModel):
    dataset_id: str

class ProcessedStatisticsResponse(BaseModel):
    statistics: List[List[Any]]

@router.post("/process", response_model=ProcessedStatisticsResponse)
async def process_dataset_backend(body: DatasetProcessRequest):
    dataset_id = body.dataset_id
    doc = datasets.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_id = doc["latest_version_file_id"]
    grid_out = fs.get(file_id)
    csv_bytes = grid_out.read()
    csv_text = csv_bytes.decode("utf-8")

    result = process_dataset(csv_text)

    return ProcessedStatisticsResponse(**result)