from pydantic import BaseModel
from typing import List, Any
from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
from preprocessing.missing_Values import check_missing_values, handle_missing_values
from preprocessing.encoding import one_hot_encode_text
from preprocessing.scale_features import scale_features_from_text
import os
import numpy as np

router = APIRouter()
MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["nocode_ml"]
fs = GridFS(db)
datasets = db["datasets"]

def clean_preview(preview):
    cleaned = []
    for row in preview:
        cleaned_row = []
        for val in row:
            if isinstance(val, (np.float32, np.float64)):
                val = float(val)
            if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
                cleaned_row.append(None)
            else:
                cleaned_row.append(val)
        cleaned.append(cleaned_row)
    return cleaned

class MissingCheckRequest(BaseModel):
    dataset_id: str

class MissingHandleRequest(BaseModel):
    dataset_id: str
    target_variable: str
    task: str   


class MissingCheckResponse(BaseModel):
    missing_values: List[List[Any]]


class MissingHandleResponse(BaseModel):
    processed_dataset: List[List[Any]]  
    changes: List[str]

def dataframe_to_csv_bytes(df):
    from io import StringIO
    buffer = StringIO()
    df.to_csv(buffer, index=False)
    return buffer.getvalue().encode("utf-8")


@router.post("/missing/check", response_model=MissingCheckResponse)
async def check_missing_endpoint(body: MissingCheckRequest):

    doc = datasets.find_one({"_id": ObjectId(body.dataset_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_id = doc["latest_version_file_id"]
    csv_text = fs.get(file_id).read().decode("utf-8")

    result = check_missing_values(csv_text)
    return result


@router.post("/missing/handle", response_model=MissingHandleResponse)
async def handle_missing_endpoint(body: MissingHandleRequest):

    doc = datasets.find_one({"_id": ObjectId(body.dataset_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_id = doc["latest_version_file_id"]
    csv_text = fs.get(file_id).read().decode("utf-8")

    processed_df, preview, changes = handle_missing_values(
        csv_text,
        body.target_variable,
        body.task
    )

    preview = clean_preview(preview)

    updated_csv_bytes = dataframe_to_csv_bytes(processed_df)

    new_file_id = fs.put(updated_csv_bytes, filename="latest_processed.csv")

    datasets.update_one(
        {"_id": ObjectId(body.dataset_id)},
        {"$set": {"latest_version_file_id": new_file_id, "preview": preview}}
    )

    return {
        "processed_dataset": preview,
        "changes": changes
    }


class OneHotRequest(BaseModel):
    dataset_id: str
    target_variable: str

class OneHotResponse(BaseModel):
    preview: List[List[Any]]

@router.post("/encoding", response_model=OneHotResponse)
async def one_hot_encode_endpoint(body: OneHotRequest):

    dataset_id = body.dataset_id
    target_variable = body.target_variable

    doc = datasets.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Dataset not found")

    file_id = doc["latest_version_file_id"]
    csv_text = fs.get(file_id).read().decode("utf-8")

    processed_df, preview, encoder_file_bytes = one_hot_encode_text(csv_text, target_variable)

    new_file_id = fs.put(
        dataframe_to_csv_bytes(processed_df),
        filename="one_hot_encoded.csv"
    )

    preview = clean_preview(preview)

    update_data = {
        "latest_version_file_id": new_file_id,
        "preview": preview,
        "status": "encoded"
    }

    if encoder_file_bytes:
        encoder_file_id = fs.put(encoder_file_bytes, filename=f"{target_variable}_label_encoder.pkl")
        update_data["label_encoder_file_id"] = encoder_file_id

    datasets.update_one(
        {"_id": ObjectId(dataset_id)},
        {"$set": update_data}
    )

    return {
        "preview": preview,
    }

class ScalingRequest(BaseModel):
    dataset_id: str
    method: str = "standard"   
    target_variable: str | None = None

class ScalingResponse(BaseModel):
    message: str | None = None
    preview: List[List[Any]]

@router.post("/scaling", response_model=ScalingResponse)
async def scaling_endpoint(body: ScalingRequest):

    dataset_id = body.dataset_id
    method = body.method
    target_variable = body.target_variable

    doc = datasets.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset not found")

    file_id = doc["latest_version_file_id"]
    csv_text = fs.get(file_id).read().decode("utf-8")

    df_scaled, preview, message = scale_features_from_text(
        csv_text, method, target_variable
    )

    new_file_id = fs.put(
        dataframe_to_csv_bytes(df_scaled),
        filename="scaled_dataset.csv"
    )

    preview = clean_preview(preview)

    datasets.update_one(
        {"_id": ObjectId(dataset_id)},
        {
            "$set": {
                "latest_version_file_id": new_file_id,
                "preview": preview,
                "status": "scaled"
            }
        }
    )

    return ScalingResponse(
        message=message,
        preview=preview
    )