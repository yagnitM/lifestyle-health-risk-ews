import pandas as pd
import os
from pathlib import Path

def merge_health_data():
    base_path = Path(__file__).parent.parent
    raw_data_path = base_path / 'data' / 'raw'
    output_path = base_path / 'data' / 'processed'
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    file_categories = {
        'diabetes.csv': 'diabetes',
        'diet.csv': 'diet',
        'fitness.csv': 'fitness',
        'mental_physical.csv': 'mental_health',
        'sleep.csv': 'sleep',
        'substance.csv': 'substance_use',
        'weight_loss.csv': 'weight_management'
    }
    
    merged_data = []
    stats = {}
    
    for filename, category in file_categories.items():
        filepath = raw_data_path / filename
        
        if filepath.exists():
            df = pd.read_csv(filepath)
            df['health_category'] = category
            df['source_file'] = filename
            merged_data.append(df)
            stats[category] = len(df)
            print(f"✓ Loaded {filename}: {len(df)} records")
        else:
            print(f"✗ File not found: {filename}")
            stats[category] = 0
    
    if not merged_data:
        print("Error: No data files found to merge")
        return None
    
    final_df = pd.concat(merged_data, ignore_index=True)
    
    output_file = output_path / 'merged_health_data.csv'
    final_df.to_csv(output_file, index=False)
    
    print(f"\n{'='*50}")
    print(f"✅ Merged dataset saved: {output_file}")
    print(f"{'='*50}")
    print(f"Total records: {len(final_df):,}")
    print(f"\nCategory Distribution:")
    print("-" * 50)
    
    category_counts = final_df['health_category'].value_counts()
    for category, count in category_counts.items():
        percentage = (count / len(final_df)) * 100
        print(f"{category:20s}: {count:6,} ({percentage:5.2f}%)")
    
    print("-" * 50)
    
    if 'title' in final_df.columns and 'selftext' in final_df.columns:
        final_df['text_length'] = final_df['selftext'].fillna('').str.len()
        print(f"\nText Statistics:")
        print(f"  Average text length: {final_df['text_length'].mean():.0f} characters")
        print(f"  Median text length: {final_df['text_length'].median():.0f} characters")
    
    print(f"\nColumns in merged dataset: {list(final_df.columns)}")
    print(f"Missing values per column:")
    missing = final_df.isnull().sum()
    for col, count in missing[missing > 0].items():
        print(f"  {col}: {count}")
    
    return final_df

if __name__ == "__main__":
    df = merge_health_data()
    if df is not None:
        print(f"\n✅ Data merging completed successfully!")
    else:
        print(f"\n❌ Data merging failed!")