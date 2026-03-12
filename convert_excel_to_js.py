
import pandas as pd
import json
import os

def convert_excel_to_js():
    excel_path = 'data/1st최초만기도래, 재계약만기도래, 약정만료 대상 목표.xlsx'
    output_path = 'data/targets.js'
    
    print(f"Reading Excel file: {excel_path}")
    # Load specific columns to save memory
    cols = ['관리고객명', '담당자명', '설치주소', '계약상태', '계약종료일', '위도', '경도', '시']
    df = pd.read_excel(excel_path, usecols=cols)
    
    # Filter by specific cities: 서울, 강원, 경기
    target_cities = ['서울', '강원', '경기']
    df = df[df['시'].isin(target_cities)]
    
    # Drop rows without names or coordinates
    df = df.dropna(subset=['관리고객명', '위도', '경도'])
    
    targets = []
    for _, row in df.iterrows():
        # Handle nan values for other fields
        manager = str(row['담당자명']) if pd.notna(row['담당자명']) else "미지정"
        address = str(row['설치주소']) if pd.notna(row['설치주소']) else ""
        status = str(row['계약상태']) if pd.notna(row['계약상태']) else "정보없음"
        expiry_date = str(row['계약종료일']) if pd.notna(row['계약종료일']) else ""
        
        targets.append({
            "name": str(row['관리고객명']),
            "manager": manager,
            "address": address,
            "status": status,
            "lat": float(row['위도']),
            "lng": float(row['경도']),
            "expiryDate": expiry_date
        })
    
    print(f"Converted {len(targets)} targets.")
    
    # Write to JS file
    js_content = f"const TARGETS = {json.dumps(targets, ensure_ascii=False, indent=4)};"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Successfully updated {output_path}")

if __name__ == "__main__":
    convert_excel_to_js()
