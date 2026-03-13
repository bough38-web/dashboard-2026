import pandas as pd
import json

# Paths
SUSPENSION_EXCEL = '/Users/heebonpark/Downloads/내프로젝트모음/2026년 관리고객 재계약 관리/data/정지,부실.xlsx'
MAPPING_EXCEL = '/Users/heebonpark/Downloads/내프로젝트모음/2026년 관리고객 재계약 관리/data/영업구역별_주소현행화_최종_20260304.xlsx'
OUTPUT_JS = '/Users/heebonpark/Downloads/내프로젝트모음/2026년 관리고객 재계약 관리/data/suspension_targets.js'

def process_data():
    # Load suspension data
    df_susp = pd.read_excel(SUSPENSION_EXCEL)
    
    # Load mapping data
    df_map = pd.read_excel(MAPPING_EXCEL)
    mapping = df_map[['영업구역 수정', 'SP담당']].drop_duplicates().set_index('영업구역 수정')['SP담당'].to_dict()
    
    # Map manager names
    df_susp['담당자'] = df_susp['영업구역정보'].map(mapping)
    
    # Fill NaN for 담당자
    df_susp['담당자'] = df_susp['담당자'].fillna('미지정')
    
    # Select and rename columns
    # '계약번호', '상호', '설치주소', '위도', '경도', '지사', '담당자', '부실여부(체납제외)', '조회구분'
    df_final = df_susp[['계약번호', '상호', '설치주소', '위도', '경도', '지사', '담당자', '부실여부(체납제외)', '조회구분']].copy()
    df_final.columns = ['id', 'name', 'address', 'lat', 'lng', 'branch', 'manager', 'is_defect', 'type']
    
    # Clean up branch names (Remove '지사' suffix if inconsistent, but targets.js uses '중앙지사' style often)
    # Let's see what index.html/auth_config.js uses. It uses '중앙지사'.
    # suspension excel uses '중앙'. Let's append '지사'.
    df_final['branch'] = df_final['branch'].apply(lambda x: f"{x}지사" if not str(x).endswith('지사') else x)
    
    # Convert to list of dicts
    records = df_final.to_dict(orient='records')
    
    # Write to JS
    with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
        f.write('const SUSPENSION_TARGETS = ')
        json.dump(records, f, ensure_ascii=False, indent=2)
        f.write(';')

if __name__ == '__main__':
    process_data()
    print(f"Exported to {OUTPUT_JS}")
