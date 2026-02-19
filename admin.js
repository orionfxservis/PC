// Admin Logic

// Initial Data Loading
let categories = [];
let products = [];
let banners = [];
let editIndex = -1; // State to track editing

// DOM Elements
const categoryForm = document.getElementById('categoryForm');
const categoryList = document.getElementById('categoryList');
const totalProductsEl = document.getElementById('totalProducts');
const totalCategoriesEl = document.getElementById('totalCategories');
const totalCompaniesEl = document.getElementById('totalCompanies');
const fieldsContainer = document.getElementById('fieldsContainer');
const submitBtn = categoryForm ? categoryForm.querySelector('button[type="submit"]') : null;

// Banner DOM
const bannerForm = document.getElementById('bannerForm');
const bannerList = document.getElementById('bannerList');
const bannerImageInput = document.getElementById('bannerImage');
const bannerPreview = document.getElementById('bannerPreview');

// --- Initialization ---

async function initAdmin() {
    try {
        [categories, products, banners] = await Promise.all([
            DataService.getCategories(),
            DataService.getProducts(),
            DataService.getBanners()
        ]);

        updateUI();
        renderBanners();
        renderAdminProducts(); // New function for products
        populateCategoryDropdown(); // New function for form

        // Ensure one field is there at start if container exists
        if (fieldsContainer && fieldsContainer.children.length === 0) {
            window.addField();
        }

        updateBannerPreview();
    } catch (error) {
        console.error("Failed to load admin data:", error);
        alert("Failed to load data. Please try refreshing.");
    }
}

// --- Categories Functions ---

async function saveCategories() {
    await DataService.saveCategories(categories);
    updateUI();
}

function updateUI() {
    // Update Stats
    if (totalCategoriesEl) totalCategoriesEl.textContent = categories.length;
    if (totalProductsEl) totalProductsEl.textContent = products.length;

    // Render Categories
    if (categoryList) {
        categoryList.innerHTML = categories.map((cat, index) => {
            const fields = cat.fields || [];
            const fieldBadges = fields.map(f => `<span class="badge">${f.name} <small>(${f.type})</small></span>`).join(' ');
            return `
            <tr>
                <td>${cat.name}</td>
                <td>${cat.subCategory}</td>
                <td><div class="field-badges">${fieldBadges}</div></td>
                <td>
                    <button class="edit-btn" onclick="editCategory(${index})"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" onclick="deleteCategory(${index})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `}).join('');
    }
}

async function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category?')) {
        categories.splice(index, 1);
        await saveCategories();
    }
}

window.editCategory = (index) => {
    editIndex = index;
    const cat = categories[index];

    // Populate Form
    document.getElementById('catName').value = cat.name;
    document.getElementById('subCatName').value = cat.subCategory;

    // Populate Fields
    fieldsContainer.innerHTML = '';
    const fields = cat.fields || [];
    fields.forEach(field => {
        window.addField(field.name, field.type);
    });

    // Update Button Text
    if (submitBtn) submitBtn.textContent = "Update Category";

    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
};

// Dynamic Fields Logic
window.addField = (name = '', type = 'text') => {
    const div = document.createElement('div');
    div.className = 'field-row';
    div.innerHTML = `
        <input type="text" placeholder="Field Name" class="field-name" value="${name}" required>
        <select class="field-type">
            <option value="text" ${type === 'text' ? 'selected' : ''}>Text</option>
            <option value="number" ${type === 'number' ? 'selected' : ''}>Number</option>
            <option value="select" ${type === 'select' ? 'selected' : ''}>Dropdown</option>
        </select>
        <button type="button" class="remove-btn" onclick="removeField(this)">-</button>
    `;
    fieldsContainer.appendChild(div);
};

window.removeField = (btn) => {
    btn.parentElement.remove();
};

// Event Listeners: Category
if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('catName').value;
        const subCategory = document.getElementById('subCatName').value;

        // Harvest fields
        const fieldRows = document.querySelectorAll('.field-row');
        const fields = Array.from(fieldRows).map(row => ({
            name: row.querySelector('.field-name').value,
            type: row.querySelector('.field-type').value
        })).filter(f => f.name.trim() !== "");

        if (editIndex === -1) {
            // Create
            categories.push({ name, subCategory, fields });
        } else {
            // Update
            categories[editIndex] = { name, subCategory, fields };
            editIndex = -1;
            if (submitBtn) submitBtn.textContent = "Add Category";
        }

        await saveCategories();

        categoryForm.reset();
        fieldsContainer.innerHTML = ''; // Clear fields
        window.addField(); // Add back one empty field
    });
}

// --- Banner Functions ---

async function saveBanners() {
    await DataService.saveBanners(banners);
    renderBanners();
}

function renderBanners() {
    if (!bannerList) return;
    bannerList.innerHTML = banners.map((banner, index) => `
        <div class="banner-item">
            <img src="${banner.image}" alt="Banner">
            ${banner.link ? `<a href="${banner.link}" target="_blank" class="banner-link"><i class="fa-solid fa-link"></i> ${banner.link}</a>` : ''}
            <button class="delete-btn" onclick="deleteBanner(${index})"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

async function deleteBanner(index) {
    if (confirm('Delete this banner?')) {
        banners.splice(index, 1);
        await saveBanners();
    }
}

function updateBannerPreview() {
    if (!bannerImageInput || !bannerPreview) return;
    const url = bannerImageInput.value;
    if (url) {
        bannerPreview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 100%; border-radius: 10px;">`;
    } else {
        bannerPreview.innerHTML = `<p>Image preview will appear here</p>`;
    }
}

if (bannerImageInput) {
    bannerImageInput.addEventListener('input', updateBannerPreview);
}

if (bannerForm) {
    bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const image = document.getElementById('bannerImage').value;
        const link = document.getElementById('bannerLink').value;

        banners.push({ image, link });
        await saveBanners();
        bannerForm.reset();
        updateBannerPreview();
    });
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function logout() {
    window.location.href = 'index.html';
}

// Init
// Init
window.addEventListener('load', initAdmin);

// --- Product Functions ---

function populateCategoryDropdown() {
    const prodCategorySelect = document.getElementById('prodCategory');
    if (prodCategorySelect) {
        // user wants "Category" then "Sub Category".
        // Assuming categories have unique names and mapped sub-categories.
        // For now, simpler approach: List all unique category names.
        const uniqueCategories = [...new Set(categories.map(c => c.name))];
        prodCategorySelect.innerHTML = '<option value="">Select Category</option>' +
            uniqueCategories.map(name => `<option value="${name}">${name}</option>`).join('');

        // Add listener
        prodCategorySelect.addEventListener('change', () => {
            const selectedCat = prodCategorySelect.value;
            const prodSubCategorySelect = document.getElementById('prodSubCategory');
            if (prodSubCategorySelect) {
                // Filter sub-categories for this category name
                const relevantCats = categories.filter(c => c.name === selectedCat);
                // Assuming 'subCategory' is the field for Item Type
                prodSubCategorySelect.innerHTML = '<option value="">Select Sub Category</option>' +
                    relevantCats.map((cat, index) => `<option value="${cat.subCategory}">${cat.subCategory}</option>`).join('');
            }
        });
    }
}

const adminProductForm = document.getElementById('adminProductForm');

if (adminProductForm) {
    adminProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Find the full category object based on selection
        // We need the original category object to link correct compatibility if needed, 
        // but user schema seems flat for now regarding product -> category link.
        // using the values from dropdowns.

        const newProduct = {
            id: Date.now(),
            category: document.getElementById('prodCategory').value,
            subCategory: document.getElementById('prodSubCategory').value,
            name: document.getElementById('prodName').value,
            variety: document.getElementById('prodVariety').value,
            qty: document.getElementById('prodQty').value,
            price: document.getElementById('prodPrice').value,
            brand: document.getElementById('prodBrand').value,
            contact: document.getElementById('prodContact').value,
            whatsapp: document.getElementById('prodWhatsapp').value,
            delivery: document.getElementById('prodDelivery').value,
            address: document.getElementById('prodAddress').value,
            image: document.getElementById('prodImage').value || 'https://via.placeholder.com/150',
        };

        products.push(newProduct);
        await DataService.saveProducts(products);

        alert('Product Added Successfully!');
        adminProductForm.reset();
        renderAdminProducts();
        updateUI(); // Update stats
    });
}

function renderAdminProducts() {
    const adminProductList = document.getElementById('adminProductList');
    if (adminProductList) {
        adminProductList.innerHTML = products.map((prod, index) => `
            <div class="product-row">
                <img src="${prod.image}" alt="${prod.name}">
                <div>${prod.name}<br><small>${prod.variety || ''}</small></div>
                <div>${prod.category} <br> <small>${prod.subCategory}</small></div>
                <div style="color: var(--primary-color)">Rs. ${prod.price}</div>
                <div>
                   <button class="delete-btn" onclick="deleteProduct(${index})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
}

window.deleteProduct = async (index) => {
    if (confirm('Delete this product?')) {
        products.splice(index, 1);
        await DataService.saveProducts(products);
        renderAdminProducts();
        updateUI();
    }
};

