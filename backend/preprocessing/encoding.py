import numpy as np
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
import joblib
import io
import pandas as pd
from io import StringIO

def one_hot_encode_text(csv_text: str, target_variable: str | None):
    df = pd.read_csv(StringIO(csv_text))

    if target_variable and target_variable in df.columns:
        y = df[target_variable]
        X = df.drop(columns=[target_variable])
    else:
        y = None
        X = df

    categorical_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()

    try:
        encoder = OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore")
    except TypeError:
        encoder = OneHotEncoder(drop="first", sparse=False, handle_unknown="ignore")

    ct = ColumnTransformer(
        transformers=[("onehot", encoder, categorical_cols)],
        remainder="passthrough"
    )

    transformed = ct.fit_transform(X)

    try:
        feature_names = encoder.get_feature_names_out(categorical_cols)
    except:
        feature_names = [
            f"{col}_{i}"
            for col in categorical_cols
            for i in range(len(X[col].unique()) - 1)
        ]

    numeric_cols = [col for col in X.columns if col not in categorical_cols]
    final_columns = list(feature_names) + numeric_cols

    df_encoded = pd.DataFrame(transformed, columns=final_columns)

    encoder_file_bytes = None
    if y is not None:
        if y.dtype in ["object", "category"]:
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y)

            buf = io.BytesIO()
            joblib.dump(label_encoder, buf)
            buf.seek(0)
            encoder_file_bytes = buf.read()

        df_encoded[target_variable] = y

    preview = []

    preview.append(list(df_encoded.columns))

    for _, row in df_encoded.head(20).iterrows():
        preview.append([
            (val.item() if hasattr(val, "item") else val)
            for val in row.values
        ])

    return df_encoded, preview, encoder_file_bytes
