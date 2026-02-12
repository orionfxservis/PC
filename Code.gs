function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const products = rows.map(row => {
    let product = {};
    headers.forEach((header, index) => {
      product[header] = row[index];
    });
    return product;
  });

  return ContentService.createTextOutput(JSON.stringify(products)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Products");
  if (!sheet) return ContentService.createTextOutput("Error: Sheet 'Products' not found").setMimeType(ContentService.MimeType.TEXT);

  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const data = request.data;
    
    // Get headers and trim them to avoid "ID " vs "ID" issues
    const rawHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = rawHeaders.map(h => String(h).trim());

    if (action === "create") {
      const row = headers.map(header => data[header] || "");
      sheet.appendRow(row);
      return ContentService.createTextOutput("Created").setMimeType(ContentService.MimeType.TEXT);
    } 
    
    else if (action === "update") {
      const idColumnIndex = headers.indexOf("ID");
      if (idColumnIndex === -1) return ContentService.createTextOutput("Error: ID column not found in Sheet Headers").setMimeType(ContentService.MimeType.TEXT);
      
      const allData = sheet.getDataRange().getValues();
      let found = false;
      
      // Loop through rows to find matching ID (skipping header)
      for (let i = 1; i < allData.length; i++) {
        // Correct column index usage (sheet data is 0-indexed in array)
        if (String(allData[i][idColumnIndex]) === String(data.ID)) {
          const newRow = headers.map(header => data[header] || "");
          sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
          found = true;
          break;
        }
      }
      
      if (found) return ContentService.createTextOutput("Updated").setMimeType(ContentService.MimeType.TEXT);
      else return ContentService.createTextOutput("Error: ID " + data.ID + " not found in Sheet").setMimeType(ContentService.MimeType.TEXT);
    } 
    
    else if (action === "delete") {
      const idColumnIndex = headers.indexOf("ID");
      if (idColumnIndex === -1) return ContentService.createTextOutput("Error: ID column not found").setMimeType(ContentService.MimeType.TEXT);
      
      const allData = sheet.getDataRange().getValues();
      for (let i = 1; i < allData.length; i++) {
        if (String(allData[i][idColumnIndex]) === String(data.ID)) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput("Deleted").setMimeType(ContentService.MimeType.TEXT);
        }
      }
      return ContentService.createTextOutput("Error: ID " + data.ID + " not found").setMimeType(ContentService.MimeType.TEXT);
    }

    return ContentService.createTextOutput("Error: Invalid Action " + action).setMimeType(ContentService.MimeType.TEXT);
    
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
