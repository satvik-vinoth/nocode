# train_model.py

from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.ensemble import GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os
import numpy as np

def save_model(model, session_id, model_name):
    os.makedirs("models", exist_ok=True)
    path = f"models/{session_id}{model_name}.pkl"
    joblib.dump(model, path)

def train_and_evaluate(model_name, X_train_raw, y_train, X_test_raw, y_test, session_id):
    # Remove headers from X_train/X_test
    X_train = X_train_raw[1:]
    X_test = X_test_raw[1:]

    # Convert all strings to floats
    X_train = [[float(cell) for cell in row] for row in X_train]
    X_test = [[float(cell) for cell in row] for row in X_test]
    y_train = [float(val) for val in y_train]
    y_test = [float(val) for val in y_test]

    # Select model
    if model_name == "Linear Regression":
        model = LinearRegression()
    elif model_name == "Decision Tree Regression":
        model = DecisionTreeRegressor()
    elif model_name == "Random Forest Regression":
        model = RandomForestRegressor()
    elif model_name == "Ridge Regression":
        model = Ridge()
    elif model_name == "Lasso Regression":
        model = Lasso()
    elif model_name == "Support Vector Regression (SVR)":
        model = SVR()
    elif model_name == "K-Nearest Neighbors (KNN) Regression":
        model = KNeighborsRegressor()
    elif model_name == "Polynomial Regression":
        model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
    elif model_name == "Gradient Boosting Regression (GBR)":
        model = GradientBoostingRegressor()
    elif model_name == "XGBoost Regression":
        model = XGBRegressor()
    else:
        raise ValueError("Unsupported model name.")

    # Train
    model.fit(X_train, y_train)

    # Predict
    preds = model.predict(X_test)


    # Evaluate
    metrics = {
        "mse": mean_squared_error(y_test, preds),
        "mae": mean_absolute_error(y_test, preds),
        "r2_score": r2_score(y_test, preds)
    }

    save_model(model, session_id ,model_name)

    model_info = {}
    if hasattr(model, "coef_"):
        model_info["coefficients"] = model.coef_.tolist()
    if hasattr(model, "intercept_"):
        model_info["intercept"] = model.intercept_.tolist()

    return {
        "message": f"{model_name} trained and saved.",
        "metrics": metrics,
        "model_info": model_info
    }
