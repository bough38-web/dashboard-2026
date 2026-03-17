import pandas as pd
import json
import os
import re

def mask_name(name):
    if not name or pd.isna(name):
        return ""
    name = str(name).strip()
    if len(name) <= 2:
        return name[0] + "*"
    return name[:2] + "*" * (len(name) - 2)

def mask_address(address):
    if not address or pd.isna(address):
        return ""
    address = str(address).strip()
    match = re.search(r'([가-힣0-9]+(?:동|읍|면|리|가))(?:\s|$)', address)
    if match:
        end_idx = match.end(1)
        prefix = address[:end_idx]
        suffix = address[end_idx:]
        masked_suffix = "".join(['*' if not c.isspace() else c for c in suffix])
        return prefix + masked_suffix
    return address

def generate_voc_data():
    voc_file = 'data/VOC정보조회.xlsx'
    mapping_file = 'data/영업구역별_주소현행화_최종_20260304.xlsx'
    output_file = 'data/voc_targets.js'

    if not os.path.exists(voc_file):
        # print(f"Error: {voc_file} not found.")
        return

    # Load VOC data
    df = pd.read_excel(voc_file)
    
    # Prefix mapping for branches (Fallback/Direct)
    branch_map = {
        'G0001': '강북지사', 'P0001': '강북지사',
        'G0002': '서대문지사', 'P0002': '서대문지사',
        'G0003': '고양지사', 'P0003': '고양지사',
        'G0004': '중앙지사', 'P0004': '중앙지사',
        'G0005': '의정부지사', 'P0005': '의정부지사',
        'G0006': '남양주지사', 'P0006': '남양주지사',
        'G0007': '강릉지사', 'P0007': '강릉지사',
        'G0008': '원주지사', 'P0008': '원주지사'
    }

    # Map branch name based on 영업구역 prefix
    def get_branch(row):
        code = str(row['영업구역'])
        prefix = code[:5]
        # print(f"DEBUG: code={code}, prefix={prefix}")
        return branch_map.get(prefix, '기타')

    df['branch'] = df.apply(get_branch, axis=1)
    
    # print(f"DEBUG: df['branch'] values: {df['branch'].unique()}")

    # Clean manager names
    df['manager'] = df['담당자'].str.strip()

    # Process and Map columns
    processed_data = []
    print(f"DEBUG: Starting processing loop over {len(df)} rows...")
    for i, row in df.iterrows():
        lat = row['위도']
        lng = row['경도']
        
        if pd.isna(lat) or pd.isna(lng):
            # print(f"DEBUG: Skipping row {i} due to null coordinates")
            continue
            
        try:
            # Clean ARPU (handle strings like '150,000')
            arpu_val = row['합산월정료(KTT+KT)']
            if isinstance(arpu_val, str):
                arpu_val = arpu_val.replace(',', '').split('.')[0]
            
            item = {
                'contractNo': str(row['계약번호']),
                'name': mask_name(row['상호']),
                'branch': row['branch'],
                'manager': str(row['영업구역']).strip(), # Use Area Number directly
                'address': mask_address(row['설치주소']),
                'lat': float(lat),
                'lng': float(lng),
                'arpu': int(float(arpu_val)) if not pd.isna(arpu_val) else 0,
                'type': 'voc'
            }
            processed_data.append(item)
        except Exception as e:
            # print(f"DEBUG: Error processing row {i}: {e}")
            continue

    # Write to JS file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("const VOC_TARGETS = ")
        f.write(json.dumps(processed_data, ensure_ascii=False, indent=4))
        f.write(";")

    # print(f"Successfully generated {output_file} with {len(processed_data)} records.")

if __name__ == "__main__":
    generate_voc_data()
