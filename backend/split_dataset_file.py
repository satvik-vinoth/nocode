# split_dataset_file.py
import json
import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np


def split_dataset_file(csv_path: str, target_column: str, test_percentage: float = 20.0, is_classification: bool = False):
    df = pd.read_csv(csv_path)

    if target_column not in df.columns:
        return {"error": f"Target column '{target_column}' not found."}

    X = df.drop(columns=[target_column])
    y = df[target_column]

    test_size = test_percentage / 100.0

    # Use stratify only if classification
    stratify = y if is_classification else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=stratify
    )

    return {
        "X_train": X_train.to_dict(orient="records"),
        "X_test": X_test.to_dict(orient="records"),
        "y_train": y_train.tolist(),
        "y_test": y_test.tolist()
    }

