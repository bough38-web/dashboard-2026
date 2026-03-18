import gspread
import pandas as pd
import json
import os
from oauth2client.service_account import ServiceAccountCredentials

# ==========================================
# CONFIGURATION - PLEASE FILL IN
# ==========================================
# 1. Google Spreadsheet ID (from URL)
SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'
# 2. Path to your Google Cloud Service Account JSON key file
CREDENTIALS_FILE = 'service_account.json' 
# 3. Output paths
OUTPUT_DIR = 'data'
SUSPENSION_JSON = os.path.join(OUTPUT_DIR, 'suspension_data.json')
DEFECT_JSON = os.path.join(OUTPUT_DIR, 'defect_data.json')

def fetch_data_from_gsheets():
    """
    Fetches data from Google Sheets and saves as JSON for the dashboard.
    """
    try:
        # Check credentials
        if not os.path.exists(CREDENTIALS_FILE):
            print(f"Error: Credentials file not found at {CREDENTIALS_FILE}")
            print("Please provide a valid service_account.json file.")
            return

        # Initialize gspread
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        client = gspread.authorize(creds)

        # Open Spreadsheet
        print(f"Opening Spreadsheet: {SPREADSHEET_ID}")
        spreadsheet = client.open_by_key(SPREADSHEET_ID)

        # 1. Fetch '기관정지율' Data
        print("Fetching '기관정지율'...")
        sheet_suspension = spreadsheet.worksheet('기관정지율')
        data_suspension = sheet_suspension.get_all_records()
        
        # 2. Fetch '기관부실율' Data
        print("Fetching '기관부실율'...")
        sheet_defect = spreadsheet.worksheet('기관부실율')
        data_defect = sheet_defect.get_all_records()

        # Ensure output directory exists
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)

        # Save to JSON
        with open(SUSPENSION_JSON, 'w', encoding='utf-8') as f:
            json.dump(data_suspension, f, ensure_ascii=False, indent=4)
        print(f"Saved: {SUSPENSION_JSON}")

        with open(DEFECT_JSON, 'w', encoding='utf-8') as f:
            json.dump(data_defect, f, ensure_ascii=False, indent=4)
        print(f"Saved: {DEFECT_JSON}")

        print("\nSuccess! Data sync complete.")

    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    fetch_data_from_gsheets()
