import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.compose import ColumnTransformer

def scale_features_file(file_path, method="standard", target_variable=None):
    df = pd.read_csv(file_path)

    # Separate target column if given
    y = None
    if target_variable and target_variable in df.columns:
        y = df[target_variable]
        df = df.drop(columns=[target_variable])

    # Select only continuous numeric columns
    continuous_numeric_cols = [
        col for col in df.columns
        if df[col].dtype in ['int64', 'float64'] and df[col].nunique() > 10
    ]

    if not continuous_numeric_cols:
        return {
            "message": "No continuous numeric columns to scale.",
            "data": df.head(10).to_dict(orient="records"),
            "columns": df.columns.tolist()
        }

    scaler = MinMaxScaler() if method == "minmax" else StandardScaler()

    ct = ColumnTransformer(
        transformers=[('scaler', scaler, continuous_numeric_cols)],
        remainder='passthrough'
    )

    scaled_array = ct.fit_transform(df)

    # Restore column order
    remaining_cols = [col for col in df.columns if col not in continuous_numeric_cols]
    new_columns = continuous_numeric_cols + remaining_cols

    df_scaled = pd.DataFrame(scaled_array, columns=new_columns)

    # Reattach target variable at the end
    if y is not None:
        df_scaled[target_variable] = y

    return {
        "message": f"Scaling applied using {'MinMaxScaler' if method == 'minmax' else 'StandardScaler'}.",
        "scaled_columns": new_columns,
        "data": df_scaled.to_dict(orient="records")
    }

