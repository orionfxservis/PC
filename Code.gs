function doGet(e) {
  // If no action parameter, return standard dashboard for direct viewing
  if (!e.parameter.action && !e.parameter.page) {
    return HtmlService.createTemplateFromFile('index').evaluate()
        .setTitle('Qeemat Point')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (e.parameter.page) {
     return HtmlService.createTemplateFromFile(e.parameter.page).evaluate()
        .setTitle('Qeemat Point - ' + e.parameter.page.charAt(0).toUpperCase() + e.parameter.page.slice(1))
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Handle REST API GET requests
  const action = e.parameter.action;
  
  switch(action) {
    case 'getProducts':
      return createJsonResponse(getProducts());
    case 'getCategories':
      return createJsonResponse(getCategories());
    case 'getBanners':
      return createJsonResponse(getBanners());
    case 'getDeals':
      return createJsonResponse(getDeals());
    case 'getUsers':
      return createJsonResponse(getUsers());
    default:
      return createJsonResponse({error: "Invalid action payload"}, 400);
  }
}

function doPost(e) {
  let requestData;
  try {
    requestData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({error: "Invalid JSON format"}, 400);
  }

  const action = requestData.action;
  const payload = requestData.payload;

  switch(action) {
    case 'saveProducts':
      return createJsonResponse({ message: saveProducts(payload) });
    case 'saveCategories':
      return createJsonResponse({ message: saveCategories(payload) });
    case 'saveBanners':
      return createJsonResponse({ message: saveBanners(payload) });
    case 'saveDeals':
      return createJsonResponse({ message: saveDeals(payload) });
    case 'saveUsers':
        return createJsonResponse({ message: saveUsers(payload) });
    case 'login':
      return createJsonResponse(loginUser(payload.username, payload.password, payload.type));
    default:
      return createJsonResponse({error: "Invalid action payload"}, 400);
  }
}

function createJsonResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// --- Serve Files (Simulated Routing) ---
function getPageContent(pageName) {
    // This function is not used in the simplified 'copy-paste' version 
    // because we will inline everything into 'index.html' on the GAS side 
    // BUT to make it easy for the user, we will tell them to create just ONE index.html
    // and we will paste ALL content there.
    return ''; 
}

// --- Generic Helper Functions ---

function getSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getData(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      // Handle JSON fields
      if (header.includes('(JSON)')) {
        try {
          obj[header.replace(' (JSON)', '')] = JSON.parse(row[index]);
        } catch (e) {
          obj[header.replace(' (JSON)', '')] = {};
        }
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });
}

function saveData(sheetName, data) {
  const sheet = getSheet(sheetName);
  sheet.clearContents();
  
  if (data.length === 0) return;
  
  // Extract all unique headers across all objects in data
  const headerSet = new Set();
  const isJsonField = {};
  
  data.forEach(item => {
    Object.keys(item).forEach(key => {
        headerSet.add(key);
        if (typeof item[key] === 'object' && item[key] !== null) {
            isJsonField[key] = true;
        }
    });
  });
  
  const baseHeaders = Array.from(headerSet);
  
  // Format headers
  const headers = baseHeaders.map(key => {
    return isJsonField[key] ? key + ' (JSON)' : key;
  });
  
  const rows = data.map(item => {
    return baseHeaders.map(key => {
      const value = item[key];
      if (value === undefined || value === null) return '';
      if (isJsonField[key] && typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    });
  });
  
  sheet.appendRow(headers);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

// --- Public APIs for Client ---

function getCategories() {
  return getData('Categories');
}

function saveCategories(categories) {
  saveData('Categories', categories);
  return 'Success';
}

function getProducts() {
  return getData('Products');
}

function saveProducts(products) {
  saveData('Products', products);
  return 'Success';
}

function getBanners() {
  return getData('Banners');
}

function saveBanners(banners) {
  saveData('Banners', banners);
  return 'Success';
}

function getDeals() {
  return getData('Deals');
}

function saveDeals(deals) {
  saveData('Deals', deals);
  return 'Success';
}

function getUsers() {
    return getData('Users');
}

function saveUsers(users) {
    saveData('Users', users);
    return 'Success';
}

// --- Setup ---
function setupSheets() {
  ['Categories', 'Products', 'Banners', 'Deals', 'Users'].forEach(sheetName => getSheet(sheetName));
}

function loginUser(username, password, type) {
    setupSheets();
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password && u.role === type);
    if (user) {
        return { success: true, user: user };
    }
    // Fallback for hardcoded admin
    if (type === 'admin' && ((username === 'Faisal' && password === '1234') || (username === 'Ashraf' && password === '1234'))) {
         return { success: true, user: { username, role: 'admin' } };
    }
    return { success: false, message: 'Invalid credentials' };
}

function getAdminData() {
    return {
        categories: getCategories(),
        products: getProducts(),
        banners: getBanners()
    };
}
