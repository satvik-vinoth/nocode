# routes_classifier.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bson import ObjectId
import pandas as pd
from gridfs import GridFS
from pymongo import MongoClient
import io
import joblib
import os
from datetime import datetime, timezone
from training.train_classification import train_classifier_model
from training.train_regression import train_regression_model

router = APIRouter()

MONGO_URL = os.getenv("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client["nocode_ml"]
datasets = db["datasets"]
fs = GridFS(db)
models_collection = db["models"]

class ClassificationTrainRequest(BaseModel):
    dataset_id: str
    model_name: str
    target_variable: str
    test_percentage: float

class ClassificationTrainResponse(BaseModel):
    message: str
    metrics: dict
    model_info: dict

def load_latest_dataset(dataset_id: str) -> pd.DataFrame:
    doc = datasets.find_one({"_id": ObjectId(dataset_id)})
    if not doc:
        raise HTTPException(404, "Dataset not found")

    file_id = doc.get("latest_version_file_id") or doc["original_file_id"]
    grid_out = fs.get(file_id)
    csv_text = grid_out.read().decode("utf-8")

    return pd.read_csv(io.StringIO(csv_text))


def save_model_to_mongo(model, dataset_id: str, model_name: str):
    buffer = io.BytesIO()
    joblib.dump(model, buffer)
    buffer.seek(0)

    model_file_id = fs.put(buffer, filename=f"{dataset_id}_{model_name}.pkl")

    models_collection.insert_one({
        "dataset_id": dataset_id,
        "model_name": model_name,
        "file_id": model_file_id
    })

    return str(model_file_id)

@router.post("/train-classifier", response_model=ClassificationTrainResponse)
def train_classifier(req: ClassificationTrainRequest):

    df = load_latest_dataset(req.dataset_id)

    try:
        model, metrics, model_info = train_classifier_model(
            df,
            req.model_name,
            req.target_variable,
            req.test_percentage
        )
    except Exception as e:
        raise HTTPException(400, str(e))

    buffer = io.BytesIO()
    joblib.dump(model, buffer)
    buffer.seek(0)

    model_file_id = fs.put(buffer, filename=f"{req.dataset_id}_{req.model_name}.pkl")

    models_collection.insert_one({
        "dataset_id": req.dataset_id,
        "model_name": req.model_name,
        "file_id": model_file_id,
        "metrics": metrics,
        "model_info": model_info,
        "test_percentage": req.test_percentage,
        "target_variable": req.target_variable,
        "created_at": datetime.now(timezone.utc)
    })

    return {
        "message": f"{req.model_name} training complete.",
        "metrics": metrics,
        "model_info": model_info
    }

class RegressionTrainRequest(BaseModel):
    dataset_id: str
    model_name: str
    target_variable: str
    test_percentage: float


class RegressionTrainResponse(BaseModel):
    message: str
    metrics: dict
    model_info: dict

@router.post("/train-regressor", response_model=RegressionTrainResponse)
def train_regression(req: RegressionTrainRequest):

    df = load_latest_dataset(req.dataset_id)

    try:
        model, metrics, model_info = train_regression_model(
            df,
            req.model_name,
            req.target_variable,
            req.test_percentage
        )
    except Exception as e:
        raise HTTPException(400, str(e))

    buffer = io.BytesIO()
    joblib.dump(model, buffer)
    buffer.seek(0)

    file_id = fs.put(buffer, filename=f"{req.dataset_id}_{req.model_name}.pkl")

    models_collection.insert_one({
        "dataset_id": req.dataset_id,
        "model_name": req.model_name,
        "file_id": file_id,
        "metrics": metrics,
        "model_info": model_info,
        "test_percentage": req.test_percentage,
        "target_variable": req.target_variable,
        "created_at": datetime.now(timezone.utc)
    })

    return {
        "message": f"{req.model_name} training complete.",
        "metrics": metrics,
        "model_info": model_info
    }