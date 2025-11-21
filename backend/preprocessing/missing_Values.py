# missing_Values.py
import pandas as pd
from sklearn.impute import SimpleImputer
from io import StringIO

def check_missing_values(csv_text: str) -> dict:
    df = pd.read_csv(StringIO(csv_text))

    missing = df.isnull().sum()

    table = []

    header = ["Column"] + list(df.columns)
    table.append(header)

    row = ["Missing"] + [int(missing[col]) for col in df.columns]
    table.append(row)

    return {
        "missing_values": table
    }




def handle_missing_values(csv_text: str, target_variable: str, task: str):
    df = pd.read_csv(StringIO(csv_text))

    if target_variable not in df.columns:
        return {"error": f"Target variable '{target_variable}' not found"}

    changes = []

    X = df.drop(columns=[target_variable])
    y = df[target_variable]

    for col in X.columns:
        missing = X[col].isnull().sum()
        if missing == 0:
            continue

        missing_pct = (missing / len(X)) * 100

        if missing_pct > 50:
            X.drop(columns=[col], inplace=True)
            changes.append(f"Dropped '{col}' (> {missing_pct:.2f}%)")
            continue

        if X[col].dtype in ["int64", "float64"]:
            imputer = SimpleImputer(strategy="mean")
        else:
            imputer = SimpleImputer(strategy="most_frequent")

        X[col] = imputer.fit_transform(X[[col]])
        changes.append(f"Imputed '{col}' ({missing_pct:.2f}%)")

    y_missing = y.isnull().sum()

    if y_missing > 0:
        if task == "regression":
            if y.dtype in ["int64", "float64"]:
                imputer = SimpleImputer(strategy="mean")
                y = imputer.fit_transform(y.values.reshape(-1, 1)).flatten()
                changes.append(f"Imputed numeric target '{target_variable}' ({y_missing})")
            else:
                df2 = pd.concat([X, y], axis=1).dropna(subset=[target_variable])
                X = df2.drop(columns=[target_variable])
                y = df2[target_variable]
                changes.append(f"Dropped rows with missing '{target_variable}' ({y_missing})")
        else:
            df2 = pd.concat([X, y], axis=1).dropna(subset=[target_variable])
            X = df2.drop(columns=[target_variable])
            y = df2[target_variable]
            changes.append(f"Dropped rows with missing '{target_variable}' ({y_missing})")

    processed_df = pd.concat([X, y], axis=1)

    preview = []

    preview.append(list(processed_df.columns))

    for _, row in processed_df.head(20).iterrows():
        preview.append([ 
            (val.item() if hasattr(val, "item") else val)
            for val in row.values
        ])

    return processed_df, preview, changes
