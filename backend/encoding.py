import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
import joblib
import os

def one_hot_encode_file(file_path, target_variable=None):
    df = pd.read_csv(file_path)

    original_columns = df.columns.tolist()

    if target_variable and target_variable in df.columns:
        y = df[target_variable]
        X = df.drop(columns=[target_variable])
    else:
        y = None
        X = df

    categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()

    # Set OneHotEncoder with fallback
    try:
        encoder = OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore')
    except TypeError:
        encoder = OneHotEncoder(drop='first', sparse=False, handle_unknown='ignore')

    # Setup ColumnTransformer
    ct = ColumnTransformer(
        transformers=[
            ('onehot', encoder, categorical_cols)
        ],
        remainder='passthrough'
    )

    # Fit and transform
    transformed_array = ct.fit_transform(X)

    # Try to get feature names
    try:
        feature_names = ct.named_transformers_['onehot'].get_feature_names_out(categorical_cols)
    except AttributeError:
        try:
            feature_names = ct.named_transformers_['onehot'].get_feature_names(categorical_cols)
        except AttributeError:
            feature_names = [f"{col}_{i}" for col in categorical_cols for i in range(len(X[col].unique()) - 1)]

    non_cat_cols = [col for col in X.columns if col not in categorical_cols]
    final_columns = list(feature_names) + non_cat_cols

    # Create DataFrame for encoded X
    df_encoded = pd.DataFrame(transformed_array, columns=final_columns)

    # Clean up values
    df_encoded.replace([np.inf, -np.inf], np.nan, inplace=True)
    df_encoded.fillna(0, inplace=True)

    # Handle label encoding if target is given
    if y is not None:
        if y.dtype in ['object', 'category']:
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y)
            os.makedirs("encoders", exist_ok=True)
            joblib.dump(label_encoder, f"encoders/{target_variable}_label_encoder.pkl")
        df_encoded[target_variable] = y 

    return {
        "original_columns": original_columns,
        "encoded_columns": df_encoded.columns.tolist(),
        "processed_dataset": df_encoded.to_dict(orient="records")
    }
