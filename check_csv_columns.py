import pandas as pd
import sys

# Read the CSV file
csv_path = r'C:\Users\Acer\OneDrive\Documents\GitHub\CWIE_Organization\backend\uploads\imports\import-1771868617207-262904448.csv'

try:
    # Read CSV
    df = pd.read_csv(csv_path, encoding='utf-8')
    
    print("=== Column Names ===")
    for i, col in enumerate(df.columns):
        print(f"{i}: {col}")
    
    print("\n=== First Data Row ===")
    if len(df) > 0:
        first_row = df.iloc[0]
        for col in df.columns:
            value = first_row[col]
            if pd.notna(value) and str(value).strip():
                print(f"{col}: {value}")
                
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
