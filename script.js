// Global Configurations
// IMPORTANT: Replace this URL with your actual Google Apps Script Web App URL after deployment
const API_URL = "https://script.google.com/macros/s/AKfycbwDHQLoh-ANYMye-FtQfvyeHPb4DU24sy4-emzuTeK-3miC4LjZ_Etw2XHPR2imRr18bA/exec";

let foodData = {};
let rawProductData = [];

document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors ---
    const mainCategorySelect = document.getElementById('main-category');
    const subCategorySelect = document.getElementById('sub-category');
    const itemTypeSelect = document.getElementById('item-type');
    const productVarietySelect = document.getElementById('product-variety');

    const subCategoryGroup = document.getElementById('sub-category-group');
    const itemTypeGroup = document.getElementById('item-type-group');
    const productVarietyGroup = document.getElementById('product-variety-group');

    const productDisplay = document.getElementById('product-display');
    const productGrid = document.getElementById('product-grid');
    const actionBar = document.getElementById('action-bar');
    const selectedCountSpan = document.getElementById('selected-count');
    const btnConfirm = document.getElementById('btn-confirm');

    // Modals
    const locationModal = document.getElementById('location-modal');
    const btnCheckLocation = document.getElementById('btn-check-location');
    const detailModal = document.getElementById('product-detail-modal');
    const closeDetail = document.querySelector('.close-detail-modal');
    const comparisonModal = document.getElementById('comparison-modal');
    const comparisonContainer = document.getElementById('comparison-container');
    const closeStart = document.querySelector('.close-modal');

    // Detail Modal Elements
    const detailName = document.getElementById('detail-name');
    const detailPrice = document.getElementById('detail-price');
    const detailOrigin = document.getElementById('detail-origin');
    const detailFreshness = document.getElementById('detail-freshness');
    const detailCity = document.getElementById('detail-city');
    const detailPhone = document.getElementById('detail-phone');
    const detailWhatsapp = document.getElementById('detail-whatsapp');
    const detailDelivery = document.getElementById('detail-delivery');
    const detailAddress = document.getElementById('detail-address');
    const detailWebsite = document.getElementById('detail-website');
    const detailImage = document.getElementById('detail-image');
    const btnDetailConfirm = document.getElementById('btn-detail-confirm');

    let currentDetailItem = null;
    let selectedItems = new Set();


    // --- Admin Panel Elements ---
    const btnAdminLogin = document.getElementById('btn-admin-login');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const closeAdminLogin = document.querySelector('.close-admin-login');
    const btnSubmitLogin = document.getElementById('btn-submit-login');
    const adminPinInput = document.getElementById('admin-pin');

    const adminDashboardModal = document.getElementById('admin-dashboard-modal');
    const closeAdminDashboard = document.querySelector('.close-admin-dashboard');
    const btnAdminLogout = document.getElementById('btn-admin-logout');

    const adminTabManage = document.getElementById('tab-manage');
    const adminTabAdd = document.getElementById('tab-add');
    const adminProductTable = document.getElementById('admin-product-table');

    // --- Entry Form Elements (Now inside Admin Dashboard) ---
    const entryForm = document.getElementById('product-entry-form');
    const entryCategoryInput = document.getElementById('entry-category');
    const entrySubCategoryInput = document.getElementById('entry-sub-category');
    const entryItemTypeInput = document.getElementById('entry-item-type');
    const categoryList = document.getElementById('category-list');
    const subCategoryList = document.getElementById('sub-category-list');
    const itemTypeList = document.getElementById('item-type-list');

    const editIdInput = document.getElementById('edit-id');
    const btnSaveProduct = document.getElementById('btn-save-product');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const formTitle = document.getElementById('form-title');


    // --- Initialization ---
    checkLocationPermission();
    fetchProducts();


    // --- Location Logic ---
    function checkLocationPermission() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            console.log("Geolocation is not supported.");
        }
    }

    function showPosition(position) {
        locationModal.classList.add('hidden');
        locationModal.classList.remove('visible');
        const headerTitle = document.querySelector('.logo p');
        if (headerTitle) headerTitle.textContent = `Compare & Choose in Karachi`;
    }

    function showError(error) {
        if (error.code === error.PERMISSION_DENIED) {
            locationModal.classList.remove('hidden');
            locationModal.classList.add('visible');
        }
    }

    btnCheckLocation.addEventListener('click', () => {
        checkLocationPermission();
        alert("Please ensure Location is enabled in your browser settings, then click OK.");
        window.location.reload();
    });


    // --- Data Fetching ---
    async function fetchProducts() {
        if (API_URL === "INSERT_YOUR_WEB_APP_URL_HERE") {
            console.warn("API URL not set.");
            initializeDropdowns();
            return;
        }

        try {
            // Add timestamp to prevent caching
            const response = await fetch(API_URL + "?t=" + Date.now());
            const data = await response.json();
            rawProductData = data;
            processData(data);
            initializeDropdowns();
            renderAdminTable(); // Refresh admin table if open
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function processData(data) {
        foodData = {};
        data.forEach(item => {
            const main = item['MainCategory'];
            const sub = item['SubCategory'];
            const type = item['ItemType'];

            if (!foodData[main]) foodData[main] = {};
            if (!foodData[main][sub]) foodData[main][sub] = {};
            if (!foodData[main][sub][type]) foodData[main][sub][type] = [];

            foodData[main][sub][type].push({
                id: item['ID'],
                name: item['Product Variety'],
                price: item['Price'],
                origin: item['Name'],
                freshness: item['Freshness'],
                city: item['City'],
                phone: item['Phone No'],
                whatsapp: item['Whatsapp No'],
                delivery: item['Home Delivery No'],
                address: item['Address'],
                website: item['Website Link']
            });
        });
    }

    function initializeDropdowns() {
        mainCategorySelect.innerHTML = '<option value="" disabled selected>Choose Food Category...</option>';
        for (const category in foodData) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            mainCategorySelect.appendChild(option);
        }
    }


    // --- Public UI Logic ---

    // Main Category Change
    mainCategorySelect.addEventListener('change', (e) => {
        const selectedMain = e.target.value;
        const subCategories = foodData[selectedMain];

        resetSelect(subCategorySelect, "Select Sub Category...");
        resetSelect(itemTypeSelect, "Select Product Type...");
        resetSelect(productVarietySelect, "Select Variety...");

        subCategoryGroup.classList.remove('disabled');
        itemTypeGroup.classList.add('disabled');
        productVarietyGroup.classList.add('disabled');

        productDisplay.classList.remove('visible');
        actionBar.classList.remove('visible');
        selectedItems.clear();
        updateSelectionUI();

        if (subCategories) {
            for (const sub in subCategories) {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subCategorySelect.appendChild(option);
            }
        }
    });

    // Sub Category Change
    subCategorySelect.addEventListener('change', (e) => {
        const mainCat = mainCategorySelect.value;
        const subCat = e.target.value;
        const itemTypes = foodData[mainCat] ? foodData[mainCat][subCat] : null;

        resetSelect(itemTypeSelect, "Select Product Type...");
        resetSelect(productVarietySelect, "Select Variety...");

        itemTypeGroup.classList.remove('disabled');
        productVarietyGroup.classList.add('disabled');
        productDisplay.classList.remove('visible');

        if (itemTypes) {
            for (const type in itemTypes) {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                itemTypeSelect.appendChild(option);
            }
        }
    });

    // Item Type Change
    itemTypeSelect.addEventListener('change', (e) => {
        const mainCat = mainCategorySelect.value;
        const subCat = subCategorySelect.value;
        const itemType = e.target.value;
        const products = foodData[mainCat][subCat][itemType];

        resetSelect(productVarietySelect, "Select Variety...");
        productVarietyGroup.classList.remove('disabled');

        const uniqueVarieties = [...new Set(products.map(p => p.name))];
        uniqueVarieties.forEach(varietyName => {
            const option = document.createElement('option');
            option.value = varietyName;
            option.textContent = varietyName;
            productVarietySelect.appendChild(option);
        });

        displayProducts(products);
    });

    // Product Variety Change
    productVarietySelect.addEventListener('change', (e) => {
        const mainCat = mainCategorySelect.value;
        const subCat = subCategorySelect.value;
        const itemType = itemTypeSelect.value;
        const selectedVariety = e.target.value;
        const products = foodData[mainCat][subCat][itemType];

        displayProducts(products.filter(p => p.name === selectedVariety));
    });

    function resetSelect(selectElement, defaultText) {
        selectElement.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        selectElement.disabled = false;
    }

    function displayProducts(products) {
        productGrid.innerHTML = '';
        productDisplay.classList.add('visible');

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;
            card.onclick = (e) => openProductDetail(product);

            card.innerHTML = `
                <div class="checkbox-overlay">
                    <input type="checkbox" ${selectedItems.has(product.id) ? 'checked' : ''} readonly>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">Rs. ${product.price}</div>
                    <div class="product-details">
                        <p><strong>Brand:</strong> ${product.origin}</p>
                        <p><strong>Size:</strong> ${product.freshness}</p>
                        ${product.city ? `<p><strong style="color: #3498db;"><i class="fas fa-map-marker-alt"></i></strong> ${product.city}</p>` : ''}
                    </div>
                </div>
            `;

            const checkboxOverlay = card.querySelector('.checkbox-overlay');
            checkboxOverlay.onclick = (e) => {
                e.stopPropagation();
                toggleSelection(product.id, card);
            };

            productGrid.appendChild(card);
        });
    }

    function toggleSelection(id, card) {
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (selectedItems.has(id)) {
            selectedItems.delete(id);
            card.classList.remove('selected');
            checkbox.checked = false;
        } else {
            selectedItems.add(id);
            card.classList.add('selected');
            checkbox.checked = true;
        }
        updateSelectionUI();
    }

    function getProductImage(product) {
        const name = (product.name || "").toLowerCase();
        if (name.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop';
        if (name.includes('pizza')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop';
        if (name.includes('sandwich')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop';
        if (name.includes('broast') || name.includes('chicken')) return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop';
        if (name.includes('biryani')) return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format&fit=crop';
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
    }

    function openProductDetail(product) {
        currentDetailItem = product;
        detailImage.src = getProductImage(product);
        detailName.textContent = product.name;
        detailPrice.textContent = `Rs. ${product.price}`;
        detailOrigin.textContent = product.origin;
        detailFreshness.textContent = product.freshness;

        detailCity.parentElement.style.display = product.city ? 'block' : 'none';
        if (product.city) detailCity.textContent = product.city;

        detailPhone.parentElement.style.display = product.phone ? 'block' : 'none';
        if (product.phone) detailPhone.textContent = product.phone;

        detailWhatsapp.parentElement.style.display = product.whatsapp ? 'block' : 'none';
        if (product.whatsapp) detailWhatsapp.textContent = product.whatsapp;

        detailDelivery.parentElement.style.display = product.delivery ? 'block' : 'none';
        if (product.delivery) detailDelivery.textContent = product.delivery;

        detailAddress.parentElement.style.display = product.address ? 'block' : 'none';
        if (product.address) detailAddress.textContent = product.address;

        detailWebsite.parentElement.style.display = product.website ? 'block' : 'none';
        if (product.website) detailWebsite.href = product.website;

        detailModal.classList.remove('hidden');
        detailModal.classList.add('visible');
    }

    closeDetail.addEventListener('click', () => {
        detailModal.classList.add('hidden');
        detailModal.classList.remove('visible');
    });

    btnDetailConfirm.addEventListener('click', () => {
        if (currentDetailItem) {
            alert(`Order Confirmed for: ${currentDetailItem.name}\nTotal: Rs. ${currentDetailItem.price}`);
            detailModal.classList.add('hidden');
            detailModal.classList.remove('visible');
        }
    });


    // --- Admin Panel Logic ---

    // Open Login Modal
    btnAdminLogin.addEventListener('click', () => {
        adminLoginModal.classList.remove('hidden');
        adminLoginModal.classList.add('visible');
    });

    closeAdminLogin.addEventListener('click', () => {
        adminLoginModal.classList.add('hidden');
        adminLoginModal.classList.remove('visible');
    });

    // Login Check
    btnSubmitLogin.addEventListener('click', () => {
        const pin = adminPinInput.value;
        if (pin === "1234") { // Simple PIN for prototype
            adminLoginModal.classList.add('hidden');
            adminLoginModal.classList.remove('visible');
            openAdminDashboard();
            adminPinInput.value = "";
        } else {
            alert("Incorrect PIN");
        }
    });

    // Open Dashboard
    function openAdminDashboard() {
        adminDashboardModal.classList.remove('hidden');
        adminDashboardModal.classList.add('visible');
        renderAdminTable();
        switchAdminTab('manage'); // Default tab
    }

    closeAdminDashboard.addEventListener('click', () => {
        adminDashboardModal.classList.add('hidden');
        adminDashboardModal.classList.remove('visible');
    });

    btnAdminLogout.addEventListener('click', () => {
        adminDashboardModal.classList.add('hidden');
        adminDashboardModal.classList.remove('visible');
        alert("Logged out");
    });

    // Tab Switching
    window.switchAdminTab = (tabName) => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        document.getElementById(`tab-${tabName}`).classList.add('active');
        // Find button checking onclick attribute is hacky, but sufficient for simple tab logic
        // Better: use data attributes. For now, just toggling visuals manually in CSS/JS loop

        if (tabName === 'manage') {
            document.querySelector("button[onclick=\"switchAdminTab('manage')\"]").classList.add('active');
            renderAdminTable();
        } else {
            document.querySelector("button[onclick=\"switchAdminTab('add')\"]").classList.add('active');
            resetEntryForm(); // Clear form for new entry
        }
    };


    // Render Admin Table
    function renderAdminTable() {
        adminProductTable.innerHTML = '';
        rawProductData.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p['Product Variety']}</td>
                <td>${p['MainCategory']} > ${p['SubCategory']}</td>
                <td>Rs. ${p['Price']}</td>
                <td>
                    <button class="action-icon edit-icon" onclick="editProduct(${p['ID']})"><i class="fas fa-edit"></i></button>
                    <button class="action-icon delete-icon" onclick="deleteProduct(${p['ID']})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            adminProductTable.appendChild(tr);
        });
    }

    // --- Add / Edit Product Logic ---

    // Populate Datalists for Form
    function populateDatalists() {
        categoryList.innerHTML = '';
        const mains = new Set(rawProductData.map(p => p['MainCategory']));
        mains.forEach(m => {
            let opt = document.createElement('option');
            opt.value = m;
            categoryList.appendChild(opt);
        });
        // Logic for sub/item types updates dynamically on input
    }

    // Listeners for dynamic datalists update (simplified)
    entryCategoryInput.addEventListener('input', () => {
        const val = entryCategoryInput.value;
        const currentSub = entrySubCategoryInput.value; // Store current value

        subCategoryList.innerHTML = '';
        const subs = new Set(rawProductData.filter(p => p['MainCategory'] === val).map(p => p['SubCategory']));
        subs.forEach(s => {
            let opt = document.createElement('option');
            opt.value = s;
            subCategoryList.appendChild(opt);
        });

        // If the current subcategory is not in the new list (and we changed main category), 
        // we might want to warn or clear, but for editing, we often want to keep custom values.
        // For now, we DO NOT clear it automatically to prevent data loss during edit.
    });

    // Reset Form
    function resetEntryForm() {
        entryForm.reset();
        editIdInput.value = '';
        formTitle.textContent = "Add New Product";
        btnSaveProduct.textContent = "Save Product";
        btnCancelEdit.classList.add('hidden');
        populateDatalists();
    }

    // Edit Product
    window.editProduct = (id) => {
        const product = rawProductData.find(p => p['ID'] == id);
        if (!product) return;

        switchAdminTab('add'); // Switch to form tab

        formTitle.textContent = "Edit Product";
        btnSaveProduct.textContent = "Update Product";
        btnCancelEdit.classList.remove('hidden');

        editIdInput.value = product['ID'];
        entryCategoryInput.value = product['MainCategory'];
        entrySubCategoryInput.value = product['SubCategory'];
        entryItemTypeInput.value = product['ItemType'];

        document.getElementById('entry-variety').value = product['Product Variety'];
        document.getElementById('entry-price').value = product['Price'];
        document.getElementById('entry-size').value = product['Freshness'];
        document.getElementById('entry-brand').value = product['Name'];
        document.getElementById('entry-phone').value = product['Phone No'];
        document.getElementById('entry-whatsapp').value = product['Whatsapp No'];
        document.getElementById('entry-delivery').value = product['Home Delivery No'];
        document.getElementById('entry-address').value = product['Address'];
        document.getElementById('entry-website').value = product['Website Link'];
    };

    btnCancelEdit.addEventListener('click', () => {
        resetEntryForm();
        switchAdminTab('manage');
    });


    // Save Product (Create or Update)
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isEdit = !!editIdInput.value;
        const actionType = isEdit ? 'update' : 'create';
        const id = isEdit ? editIdInput.value : Date.now();

        const productData = {
            "ID": id,
            "MainCategory": entryCategoryInput.value,
            "SubCategory": entrySubCategoryInput.value,
            "ItemType": entryItemTypeInput.value,
            "Product Variety": document.getElementById('entry-variety').value,
            "Price": document.getElementById('entry-price').value,
            "Freshness": document.getElementById('entry-size').value,
            "Name": document.getElementById('entry-brand').value,
            "Phone No": document.getElementById('entry-phone').value,
            "Whatsapp No": document.getElementById('entry-whatsapp').value,
            "Home Delivery No": document.getElementById('entry-delivery').value,
            "Address": document.getElementById('entry-address').value,
            "Website Link": document.getElementById('entry-website').value,
            "City": "Karachi"
        };

        const originalText = btnSaveProduct.textContent;
        btnSaveProduct.textContent = isEdit ? "Updating..." : "Saving...";
        btnSaveProduct.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: actionType, // 'create' or 'update'
                    data: productData
                })
            });

            const result = await response.text();

            if (result.includes("Updated") || result.includes("Created")) {
                alert(isEdit ? "Product Updated Successfully!" : "Product Added Successfully!");
                resetEntryForm();
                if (isEdit) switchAdminTab('manage');
                fetchProducts();
            } else {
                alert("Server Response: " + result + "\n\nMake sure ID exists and Web App is re-deployed.");
            }

        } catch (error) {
            console.error(error);
            alert("Network Error: " + error.message);
        } finally {
            btnSaveProduct.textContent = originalText;
            btnSaveProduct.disabled = false;
        }
    });

    // Delete Product
    window.deleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "delete",
                    data: { ID: id }
                })
            });

            const result = await response.text();

            if (result.includes("Deleted")) {
                alert("Product Deleted Successfully!");
                fetchProducts();
            } else {
                alert("Delete Failed: " + result);
            }

        } catch (error) {
            console.error(error);
            alert("Error deleting: " + error.message);
        }
    };


    // --- Other Listeners ---

    // Comparison Logic (Existing)
    const btnCompare = document.getElementById('btn-compare');
    btnCompare.addEventListener('click', () => {
        if (selectedItems.size < 2) {
            alert("Please select at least 2 items to compare.");
            return;
        }
        comparisonContainer.innerHTML = '';
        const itemsToCompare = rawProductData.filter(p => selectedItems.has(p['ID']));
        itemsToCompare.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'comparison-item';
            itemDiv.innerHTML = `
                <h3>${item['Product Variety']}</h3>
                <p class="price">Rs. ${item['Price']}</p>
                <div class="details">
                    <p><strong>Brand:</strong> <br>${item['Name']}</p>
                    <p><strong>Size:</strong> <br>${item['Freshness']}</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="confirmSingleOrder(${item['ID']}, '${item['Product Variety']}')">Select</button>
            `;
            comparisonContainer.appendChild(itemDiv);
        });
        comparisonModal.classList.remove('hidden');
        comparisonModal.classList.add('visible');
    });

    btnConfirm.addEventListener('click', () => {
        if (selectedItems.size === 0) {
            alert("Please select at least one item to confirm order.");
            return;
        }
        alert(`Order Confirmed for ${selectedItems.size} items!`);
    });

    window.confirmSingleOrder = (id, name) => {
        alert(`You have selected: ${name} to confirm your order!`);
        comparisonModal.classList.add('hidden');
        comparisonModal.classList.remove('visible');
    };

    function updateSelectionUI() {
        selectedCountSpan.textContent = selectedItems.size;
        if (selectedItems.size > 0) actionBar.classList.add('visible');
        else actionBar.classList.remove('visible');
    }

    // Window Click to close public modals
    window.addEventListener('click', (e) => {
        if (e.target == detailModal) {
            detailModal.classList.add('hidden');
            detailModal.classList.remove('visible');
        }
        if (e.target == comparisonModal) {
            comparisonModal.classList.add('hidden');
            comparisonModal.classList.remove('visible');
        }
        // Admin modals
        if (e.target == adminLoginModal) {
            adminLoginModal.classList.add('hidden');
            adminLoginModal.classList.remove('visible');
        }
    });

});
