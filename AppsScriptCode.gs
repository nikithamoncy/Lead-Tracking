/**
 * Antigravity CRM - Google Sheets Web App Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet -> Extensions -> Apps Script
 * 2. Paste this exact code into the `Code.gs` file.
 * 3. Click "Deploy" -> "New Deployment"
 * 4. Select type: "Web app"
 * 5. Execute as: "Me"
 * 6. Who has access: "Anyone"
 * 7. Click "Deploy" and authorize the script.
 * 8. Copy the Web App URL and provide it to the CRM.
 */

function doPost(e) {
  try {
    // Enable CORS
    var headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload provided' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action; // 'edit' or 'delete'
    var sheetName = data.sheetName || 'Sheet1'; // Pass this from the frontend if multiple sheets exist
    var rowName = data.LeadName; // The unique identifier we use to find the row
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Fallback to active sheet if name is wrong
      sheet = ss.getActiveSheet();
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var headersRow = values[0];
    
    // Find the row index by checking the "Name" column
    var nameColIndex = headersRow.indexOf('Name');
    if (nameColIndex === -1) {
      return createJsonResponse({ status: 'error', message: 'Could not find "Name" column in sheet.' }, headers);
    }
    
    var targetRowIndex = -1;
    for (var i = 1; i < values.length; i++) {
      if (values[i][nameColIndex] === rowName) {
        targetRowIndex = i + 1; // +1 because array is 0-indexed, but sheets are 1-indexed
        break;
      }
    }
    
    if (targetRowIndex === -1) {
      return createJsonResponse({ status: 'error', message: 'Could not find lead with name: ' + rowName }, headers);
    }
    
    if (action === 'delete') {
      sheet.deleteRow(targetRowIndex);
      return createJsonResponse({ status: 'success', message: 'Row deleted successfully' }, headers);
    } 
    
    else if (action === 'edit') {
      var updates = data.updates; // Object of Header -> NewValue pairs
      
      // Update each cell in the target row based on the headers
      for (var key in updates) {
        var colIndex = headersRow.indexOf(key);
        if (colIndex !== -1) {
          // colIndex + 1 because sheets are 1-indexed
          sheet.getRange(targetRowIndex, colIndex + 1).setValue(updates[key]);
        }
      }
      
      return createJsonResponse({ status: 'success', message: 'Row updated successfully' }, headers);
    }
    
    return createJsonResponse({ status: 'error', message: 'Invalid action provided' }, headers);

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() }, { "Access-Control-Allow-Origin": "*" });
  }
}

// Handle preflight requests for CORS
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

function createJsonResponse(responseObject, headers) {
  var output = ContentService.createTextOutput(JSON.stringify(responseObject))
    .setMimeType(ContentService.MimeType.JSON);
    
  if (headers) {
    // Note: Due to limitations in ContentService, CORS headers aren't always respected exactly, 
    // but Google handles the CORS redirect via opaque responses that JS `fetch(url, {mode: 'no-cors'})` handles.
  }
  
  return output;
}
