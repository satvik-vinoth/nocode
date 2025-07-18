# missing_Values.py
import pandas as pd
import json
from sklearn.impute import SimpleImputer

def check_missing_values_file(file_path: str) -> dict:
    df = pd.read_csv(file_path)
    missing_values = df.isnull().sum().to_dict()
    result = {
        "missing_values": missing_values,
        "columns": list(df.columns)
    }
    return result

def handle_missing_values_file(file_path: str, target_variable: str) -> dict:
    df = pd.read_csv(file_path)
    changes = []
    if target_variable not in df.columns:
        return {"error": "Target variable not found in dataset"}
    # Process independent and dependent variables
    X = df.drop(columns=[target_variable])
    y = df[target_variable]
    for col in X.columns:
        missing_count = X[col].isnull().sum()
        if missing_count > 0:
            missing_percent = (missing_count / len(X)) * 100
            if missing_percent > 50:
                X.drop(columns=[col], inplace=True)
                changes.append(f"Column '{col}' dropped (missing: {missing_count} rows, {missing_percent:.2f}%).")
            else:
                if X[col].dtype in ['int64', 'float64']:
                    imputer = SimpleImputer(strategy='mean')
                else:
                    imputer = SimpleImputer(strategy='most_frequent')
                X[col] = imputer.fit_transform(X[[col]])
                changes.append(f"Column '{col}' imputed (missing: {missing_count} rows, {missing_percent:.2f}%).")
    y_missing_count = y.isnull().sum()
    if y_missing_count > 0:
        combined = pd.concat([X, y], axis=1)
        combined = combined.dropna(subset=[target_variable])
        X = combined.drop(columns=[target_variable])
        y = combined[target_variable]
        changes.append(f"Rows with missing target '{target_variable}' removed (missing: {y_missing_count}).")
    processed_df = pd.concat([X, y], axis=1)
    result = {
        "processed_dataset": processed_df.to_dict(orient="records"),
        "changes": changes
    }
    return result
