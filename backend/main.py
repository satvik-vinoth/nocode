from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from dataset import router as dataset_router
from preprocess import router as preprocessing_router
from train import router as train_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(dataset_router,prefix="/dataset")
app.include_router(preprocessing_router,prefix="/preprocessing")
app.include_router(train_router,prefix="/train")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://nocode-blue.vercel.app","http://127.0.0.1:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"alive": True}