
import pandas as pd
import json
import os

def mask_name(name):
    if not name or pd.isna(name):
        return ""
    name = str(name).strip()
    if len(name) <= 2:
        return name[0] + "*"
    return name[:2] + "*" * (len(name) - 2)

def convert_excel_to_js():
    excel_path = 'data/1st최초만기도래, 재계약만기도래, 약정만료 대상 목표.xlsx'
    mapping_path = 'data/영업구역별_주소현행화_최종_20260304.xlsx'
    output_path = 'data/targets.js'
    
    # Load Mapping
    print(f"Loading mapping: {mapping_path}")
    map_df = pd.read_excel(mapping_path)
    # Create a mapping dictionary: (SP담당, 관리지사, 주소동) -> 영업구역 수정
    # This is a heuristic since we don't have perfect keys, but Area mapping usually links by manager/branch at least.
    area_map = {}
    for _, mproc in map_df.iterrows():
        key = (str(mproc['SP담당']).strip(), str(mproc['관리지사']).strip())
        area_map[key] = str(mproc['영업구역 수정']).strip()

    print(f"Reading Excel file: {excel_path}")
    # Load specific columns
    cols = [
        '관리고객명', '담당자명', '담당지사/팀', '설치주소', '계약상태', 
        '계약종료일', '위도', '경도', '시', '합산월정료(KTT+KT)', '정리2',
        '계약번호', '만기도래 월', '읍면동'
    ]
    df = pd.read_excel(excel_path, usecols=cols)
    
    # Filter by specific cities: 서울, 강원, 경기
    target_cities = ['서울', '강원', '경기']
    df = df[df['시'].isin(target_cities)]

    # Filter by '정리2' column: Exclude '정지', '설변', '해지'
    exclude_status = ['정지', '설변', '해지']
    df = df[~df['정리2'].isin(exclude_status)]
    
    # Drop rows without names or coordinates
    df = df.dropna(subset=['관리고객명', '위도', '경도'])
    
    targets = []
    for _, row in df.iterrows():
        mgr_name = str(row['담당자명']).strip() if pd.notna(row['담당자명']) else ""
        branch = str(row['담당지사/팀']).strip() if pd.notna(row['담당지사/팀']) else ""
        
        # Map to Area Number
        area_code = area_map.get((mgr_name, branch), "미지정")
        
        address = str(row['설치주소']) if pd.notna(row['설치주소']) else ""
        
        # Status renaming
        status = str(row['계약상태']) if pd.notna(row['계약상태']) else "정보없음"
        if status == '만기도래_신규':
            status = '만기도래_신규(1st)'
            
        expiry_date = str(row['계약종료일']) if pd.notna(row['계약종료일']) else ""
        if ' ' in expiry_date:
            expiry_date = expiry_date.split(' ')[0]
            
        month_val = str(row['만기도래 월']).strip() if pd.notna(row['만기도래 월']) else ""
        if month_val and '.' in month_val:
            quarter = month_val.split('.')[-1]
        else:
            quarter = "미지정"
        
        prog_val = str(row['정리2']).strip() if pd.notna(row['정리2']) else ""
        if prog_val in ["", "nan"]:
            progress = "진행대상"
        else:
            progress = prog_val
        
        contract_no = str(row['계약번호']) if pd.notna(row['계약번호']) else ""
        if contract_no.endswith('.0'):
            contract_no = contract_no[:-2]
        
        arpu_val = row['합산월정료(KTT+KT)']
        if pd.isna(arpu_val):
            arpu = 0
        elif isinstance(arpu_val, str):
            try:
                arpu = int(arpu_val.replace(',', ''))
            except ValueError:
                arpu = 0
        else:
            arpu = int(arpu_val)
            
        is_high_arpu = arpu >= 100000
        
        targets.append({
            "name": mask_name(row['관리고객명']),
            "manager": area_code, # Use Area Number instead of name
            "branch": branch,
            "address": address,
            "status": status,
            "quarter": quarter,
            "progress": progress,
            "contractNo": contract_no,
            "lat": float(row['위도']),
            "lng": float(row['경도']),
            "expiryDate": expiry_date,
            "arpu": arpu,
            "isHighArpu": is_high_arpu
        })
    
    print(f"Converted {len(targets)} targets.")
    
    # Write to JS file
    js_content = f"const TARGETS = {json.dumps(targets, ensure_ascii=False, indent=4)};"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Successfully updated {output_path}")

if __name__ == "__main__":
    convert_excel_to_js()
