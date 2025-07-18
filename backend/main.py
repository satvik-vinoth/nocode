# main.py
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from process_Dataset import process_dataset_file
from missing_Values import check_missing_values_file, handle_missing_values_file
from encoding import one_hot_encode_file 
from scale_features import scale_features_file
from split_dataset_file import split_dataset_file
from pydantic import BaseModel
from typing import List, Any
from train_model import train_and_evaluate
from train_classification import train_and_evaluate_classifier
from pydantic import BaseModel
import joblib
import os
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://ml-dashboard-wheat.vercel.app","https://*.vercel.app"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/dataset/process-dataset")
async def process_dataset_endpoint(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    result = process_dataset_file(tmp_path)
    return result

@app.post("/api/missing-values/check")
async def check_missing_endpoint(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    result = check_missing_values_file(tmp_path)
    return result

@app.post("/api/missing-values/handle")
async def handle_missing_endpoint(
    file: UploadFile = File(...),
    targetVariable: str = Form(...)
):
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    result = handle_missing_values_file(tmp_path, targetVariable)
    return result

@app.post("/api/encoding/one-hot")
async def one_hot_encoding(
    file: UploadFile = File(...),
    targetVariable: str = Form(None),
):
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    result = one_hot_encode_file(tmp_path, targetVariable)
    return result

@app.post("/api/scaling")
async def scale_features_endpoint(
    file: UploadFile = File(...),
    method: str = Form("standard") ,
    targetVariable: str = Form(None),
):
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    result = scale_features_file(tmp_path, method,targetVariable)
    return result

@app.post("/api/split-dataset")
async def split_dataset_endpoint(
    file: UploadFile = File(...),
    targetVariable: str = Form(...),
    testPercentage: float = Form(20.0),
    classification: bool = Form(False),
):
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    result = split_dataset_file(tmp_path, targetVariable, testPercentage,classification)
    return result

class TrainRequest(BaseModel):
    model_name: str
    X_train: List[List[Any]]
    y_train: List[float]  # ←✅ fix here
    X_test: List[List[Any]]
    y_test: List[float]
    session_id: str

# Response model
class TrainResponse(BaseModel):
    message: str
    metrics: dict
    model_info: dict

@app.post("/train", response_model=TrainResponse)
def train_endpoint(req: TrainRequest):
    try:
        result = train_and_evaluate(
            req.model_name,
            req.X_train,
            req.y_train,
            req.X_test,
            req.y_test,
            req.session_id
        )
        return result
    except Exception as e:
        return {
            "message": f"Training failed: {str(e)}",
            "metrics": {},
            "model_info": {}
        }
    
class ClassificationTrainRequest(BaseModel):
    model_name: str
    X_train: List[List[Any]]
    y_train: List[float]
    X_test: List[List[Any]]
    y_test: List[float]
    session_id: str

class ClassificationTrainResponse(BaseModel):
    message: str
    metrics: dict
    model_info: dict

@app.post("/train-classifier", response_model=ClassificationTrainResponse)
def train_classifier_endpoint(req: ClassificationTrainRequest):
    try:
        result = train_and_evaluate_classifier(
            req.model_name,
            req.X_train,
            req.y_train,
            req.X_test,
            req.y_test,
            req.session_id
        )
        return result
    except Exception as e:
        return {
            "message": f"Training failed: {str(e)}",
            "metrics": {},
            "model_info": {}
        }
    
