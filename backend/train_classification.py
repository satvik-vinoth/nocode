from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.linear_model import RidgeClassifier
from xgboost import XGBClassifier
import joblib
import os
import numpy as np

def save_model(model, session_id, model_name):
    os.makedirs("models", exist_ok=True)
    path = f"models/{session_id}{model_name}.pkl"
    joblib.dump(model, path)

def train_and_evaluate_classifier(model_name, X_train_raw, y_train, X_test_raw, y_test, session_id):
    # Remove headers from X_train/X_test if present
    X_train = X_train_raw[1:]
    X_test = X_test_raw[1:]

    # Convert all to float
    X_train = [[float(cell) for cell in row] for row in X_train]
    X_test = [[float(cell) for cell in row] for row in X_test]
    y_train = [float(val) for val in y_train]
    y_test = [float(val) for val in y_test]

    # Pick classifier
    if model_name == "Logistic Regression":
        model = LogisticRegression(max_iter=1000)
    elif model_name == "Decision Tree Classifier":
        model = DecisionTreeClassifier()
    elif model_name == "Random Forest Classifier":
        model = RandomForestClassifier()
    elif model_name == "Support Vector Machine (SVM)":
        model = SVC(probability=True)
    elif model_name == "K-Nearest Neighbors (KNN) Classifier":
        model = KNeighborsClassifier()
    elif model_name == "Naive Bayes":
        model = GaussianNB()
    elif model_name == "Gradient Boosting Classifier (GBC)":
        model = GradientBoostingClassifier()
    elif model_name == "XGBoost Classifier":
        model = XGBClassifier()
    elif model_name=="Ridge Classifier":
        model = RidgeClassifier()
    else:
        raise ValueError("Unsupported classification model name.")

    # Train
    model.fit(X_train, y_train)

    # Predict
    preds = model.predict(X_test)

    # Evaluate
    metrics = {
        "accuracy": accuracy_score(y_test, preds),
        "precision": precision_score(y_test, preds, average="weighted", zero_division=0),
        "recall": recall_score(y_test, preds, average="weighted", zero_division=0),
        "f1_score": f1_score(y_test, preds, average="weighted", zero_division=0),
        "confusion_matrix": confusion_matrix(y_test, preds).tolist()
    }

    save_model(model, session_id, model_name)

    model_info = {}
    if hasattr(model, "feature_importances_"):
        model_info["feature_importances"] = model.feature_importances_.tolist()

    return {
        "message": f"{model_name} trained and saved.",
        "metrics": metrics,
        "model_info": model_info
    }
