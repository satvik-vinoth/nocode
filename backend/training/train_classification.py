# training_classifier.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)


def get_classifier(model_name: str):
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Decision Tree Classifier": DecisionTreeClassifier(),
        "Random Forest Classifier": RandomForestClassifier(),
        "Support Vector Machine (SVM)": SVC(probability=True),
        "K-Nearest Neighbors (KNN) Classifier": KNeighborsClassifier(),
        "Naive Bayes": GaussianNB(),
        "Gradient Boosting Classifier (GBC)": GradientBoostingClassifier(),
        "XGBoost Classifier": XGBClassifier(),
        "Ridge Classifier": RidgeClassifier()
    }
    return models.get(model_name, None)


def train_classifier_model(df: pd.DataFrame, model_name: str, target_variable: str, test_percentage: float):

    if target_variable not in df.columns:
        raise ValueError("Target variable not found in dataset")

    X = df.drop(columns=[target_variable])
    y = df[target_variable]

    X = X.apply(pd.to_numeric, errors="coerce").fillna(0)
    y = pd.to_numeric(y, errors="coerce")

    stratify = y if len(y.unique()) <= 20 else None
    test_size = test_percentage / 100

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=42,
        stratify=stratify
    )

    model = get_classifier(model_name)
    if model is None:
        raise ValueError("Invalid model name")

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    metrics = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "precision": float(precision_score(y_test, preds, average="weighted", zero_division=0)),
        "recall": float(recall_score(y_test, preds, average="weighted", zero_division=0)),
        "f1_score": float(f1_score(y_test, preds, average="weighted", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_test, preds).tolist()
    }

    model_info = {}
    if hasattr(model, "feature_importances_"):
        model_info["feature_importances"] = model.feature_importances_.tolist()

    return model, metrics, model_info
