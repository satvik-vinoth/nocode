# train_regression_model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score


def train_regression_model(df: pd.DataFrame, model_name: str, target: str, test_pct: float):

    if target not in df.columns:
        raise ValueError("Target column not found")

    X = df.drop(columns=[target]).values
    y = df[target].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_pct / 100, random_state=42
    )

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
        model = make_pipeline(PolynomialFeatures(2), LinearRegression())
    elif model_name == "Gradient Boosting Regression (GBR)":
        model = GradientBoostingRegressor()
    elif model_name == "XGBoost Regression":
        model = XGBRegressor()
    else:
        raise ValueError("Unsupported regression model")

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    metrics = {
        "mse": float(mean_squared_error(y_test, preds)),
        "mae": float(mean_absolute_error(y_test, preds)),
        "r2_score": float(r2_score(y_test, preds)),
    }

    model_info = {}
    if hasattr(model, "coef_"):
        model_info["coefficients"] = model.coef_.tolist()
    if hasattr(model, "intercept_"):
        model_info["intercept"] = (
            model.intercept_.tolist()
            if hasattr(model.intercept_, "tolist")
            else float(model.intercept_)
        )

    return model, metrics, model_info
