import numpy as np
from io import StringIO
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.compose import ColumnTransformer
import pandas as pd

def scale_features_from_text(csv_text: str, method="standard", target_variable=None):
    df = pd.read_csv(StringIO(csv_text))

    y = None
    if target_variable and target_variable in df.columns:
        y = df[target_variable]
        df = df.drop(columns=[target_variable])

    continuous_cols = [
        col for col in df.columns
        if df[col].dtype in ['int64', 'float64'] and df[col].nunique() > 10
    ]

    if len(continuous_cols) == 0:
        preview = [list(df.columns)]
        for _, row in df.head(20).iterrows():
            preview.append([
                v.item() if hasattr(v, "item") else v
                for v in row.values
            ])
        return df, preview, "No continuous numeric columns to scale."

    scaler = MinMaxScaler() if method == "minmax" else StandardScaler()

    ct = ColumnTransformer(
        transformers=[("scaler", scaler, continuous_cols)],
        remainder="passthrough"
    )

    scaled = ct.fit_transform(df)

    remaining_cols = [c for c in df.columns if c not in continuous_cols]
    new_cols = continuous_cols + remaining_cols

    df_scaled = pd.DataFrame(scaled, columns=new_cols)

    if y is not None:
        df_scaled[target_variable] = y

    preview = [list(df_scaled.columns)]
    for _, row in df_scaled.head(20).iterrows():
        preview.append([
            v.item() if hasattr(v, "item") else v
            for v in row.values
        ])

    msg = "Scaling applied using MinMaxScaler." if method == "minmax" else "Scaling applied using StandardScaler."

    return df_scaled, preview, msg
