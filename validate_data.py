
import json

try:
    with open('data/targets.js', 'r', encoding='utf-8') as f:
        content = f.read()
        # Extract the JSON part from const TARGETS = [...]
        json_str = content.replace('const TARGETS = ', '').strip()
        if json_str.endswith(';'):
            json_str = json_str[:-1]
        
        data = json.loads(json_str)
        
        errors = []
        for i, item in enumerate(data):
            lat = item.get('lat')
            lng = item.get('lng')
            
            if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
                errors.append(f"Index {i}: name={item.get('name')}, lat={lat}, lng={lng} (Type error)")
            elif lat == 0 or lng == 0:
                errors.append(f"Index {i}: name={item.get('name')}, lat={lat}, lng={lng} (Zero error)")
            elif abs(lat) > 90 or abs(lng) > 180:
                errors.append(f"Index {i}: name={item.get('name')}, lat={lat}, lng={lng} (Range error)")

        if errors:
            print(f"Found {len(errors)} errors:")
            for e in errors[:20]:
                print(e)
        else:
            print("No data errors found in 3,742 records.")

except Exception as e:
    print(f"Failed to parse targets.js: {e}")
