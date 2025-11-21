# # process_Dataset.py
import pandas as pd
import json

def process_dataset(csv_text: str) -> dict:
    from io import StringIO
    df = pd.read_csv(StringIO(csv_text))

    describe_df = df.describe()
    table = []

    header = ["Statistic"] + list(describe_df.columns)
    table.append(header)

    for stat_name, row in describe_df.iterrows():
        table.append([stat_name] + [row[col] for col in describe_df.columns])

    return {
        "statistics": table
    }
