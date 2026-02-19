function doGet(e) {
  let page = e.parameter.page;
  if (!page) {
    return HtmlService.createTemplateFromFile('index').evaluate()
        .setTitle('Qeemat Point')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createTemplateFromFile(page).evaluate()
      .setTitle('Qeemat Point - ' + page.charAt(0).toUpperCase() + page.slice(1))
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
  
  // Extract headers
  const headers = Object.keys(data[0]).map(key => {
    // Check if value is object/array, if so mark as JSON
    if (typeof data[0][key] === 'object' && data[0][key] !== null) {
      return key + ' (JSON)';
    }
    return key;
  });
  
  const rows = data.map(item => {
    return headers.map(header => {
      const key = header.replace(' (JSON)', '');
      const value = item[key];
      if (typeof value === 'object' && value !== null) {
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

function getUsers() {
    return getData('Users');
}

function saveUsers(users) {
    saveData('Users', users);
    return 'Success';
}

// --- Setup ---
function setupSheets() {
  ['Categories', 'Products', 'Banners', 'Users'].forEach(sheetName => getSheet(sheetName));
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
