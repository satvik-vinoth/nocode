# process_Dataset.py
import pandas as pd
import json

def process_dataset_file(file_path: str) -> dict:
    df = pd.read_csv(file_path)
    statistics = df.describe().to_dict()
    statistical_measures = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']

    statistics['Statistic'] = {measure: measure for measure in statistical_measures}
    columns = list(statistics.keys())
    columns.insert(0, 'Statistic')
    columns.pop()
    all_columns = list(df.columns)

    result = {
        "columns": columns,            
        "statistics": statistics,       
        "all_columns": all_columns    
    }
    return result

if __name__ == "__main__":
    import sys
    file_path = sys.argv[1]
    result = process_dataset_file(file_path)
    print(json.dumps(result, indent=4))
