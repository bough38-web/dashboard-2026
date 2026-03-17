
import json
import os

raw_data_path = '/tmp/raw_auth_data.json'
with open(raw_data_path, 'r') as f:
    raw_data = json.load(f)

surname_map = {
    '김': 'kim', '이': 'lee', '박': 'park', '최': 'choi', '정': 'jung',
    '강': 'kang', '조': 'cho', '윤': 'yoon', '장': 'jang', '신': 'shin',
    '한': 'han', '오': 'oh', '서': 'seo', '전': 'jeon', '권': 'kwon',
    '황': 'hwang', '안': 'ahn', '송': 'song', '류': 'ryu', '홍': 'hong',
    '성': 'sung'
}

branch_passwords = {
    '중앙지사': 'central123',
    '강북지사': 'gangbuk456',
    '서대문지사': 'seodae789',
    '고양지사': 'goyang234',
    '의정부지사': 'uijeong567',
    '남양주지사': 'namyang890'
}

# Updated generation logic: Use Sales Area Number as both name and ID
refined_managers = []
# Group by area to avoid duplicates
seen_areas = set()

# Process data from raw mapping (assumed to be loaded into raw_data['managers'])
for m in raw_data['managers']:
    area_code = str(m['영업구역 수정']).strip()
    if not area_code or area_code == 'nan':
        continue
    
    if area_code in seen_areas:
        continue
    
    seen_areas.add(area_code)
    refined_managers.append({
        'name': area_code,
        'branch': m['관리지사'],
        'id': area_code,
        'pw': area_code.lower()
    })

auth_config = {
    'branches': raw_data['branches'],
    'branch_passwords': branch_passwords,
    'managers': refined_managers,
    'admin_pw': 'admin1234!!'
}

target_dir = '/Users/heebonpark/Downloads/내프로젝트모음/2026년 관리고객 재계약 관리/data'
os.makedirs(target_dir, exist_ok=True)

js_content = f"const AUTH_CONFIG = {json.dumps(auth_config, ensure_ascii=False, indent=4)};"
with open(os.path.join(target_dir, 'auth_config.js'), 'w') as f:
    f.write(js_content)

print("Generated auth_config.js successfully.")
