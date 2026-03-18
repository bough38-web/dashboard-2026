/**
 * 2026 Management Hub - Google Spreadsheet Data Sync Script
 * --------------------------------------------------------
 * HOW TO USE:
 * 1. Open your Google Spreadsheet.
 * 2. Go to 'Extensions' -> 'Apps Script'.
 * 3. Paste this code into the editor.
 * 4. Click 'Deploy' -> 'New Deployment'.
 * 5. Select 'Web App'.
 * 6. Set 'Execute as' to 'Me' and 'Who has access' to 'Anyone'.
 * 7. Copy the Web App URL and use it in your dashboard settings.
 */

function doGet() {
  const result = {
    status: "success",
    timestamp: new Date().toISOString(),
    data: {
      suspension: getSheetData('기관정지율'),
      defect: getSheetData('기관부실율')
    }
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
  } catch (e) {
    return [];
  }
}
