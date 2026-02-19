// Company User Logic

// Initial Data
let categories = [];
let products = [];

// DOM Elements
const productForm = document.getElementById('productForm');
const prodCategorySelect = document.getElementById('prodCategory');
const dynamicFieldsContainer = document.getElementById('dynamicFields');
const companyProductList = document.getElementById('companyProductList');

// Load Categories into Select
function loadCategories() {
    if (prodCategorySelect) {
        prodCategorySelect.innerHTML = '<option value="">Select Category</option>' +
            categories.map((cat, index) => `<option value="${index}">${cat.name} - ${cat.subCategory}</option>`).join('');
    }
}

// Load Dynamic Fields based on Category
window.loadCategoryFields = () => {
    const catIndex = prodCategorySelect.value;
    dynamicFieldsContainer.innerHTML = '';

    if (catIndex === "") return;

    const category = categories[catIndex];
    if (category && category.fields) {
        category.fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'input-group';

            let inputHTML = '';
            if (field.type === 'select') {
                inputHTML = `<select class="dynamic-field" data-name="${field.name}"><option>Option 1</option><option>Option 2</option></select>`; // Placeholder for options
            } else {
                inputHTML = `<input type="${field.type}" class="dynamic-field" data-name="${field.name}" placeholder="Enter ${field.name}">`;
            }

            div.innerHTML = `
                <label>${field.name}</label>
                ${inputHTML}
            `;
            dynamicFieldsContainer.appendChild(div);
        });
    }
};

// Save Product
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const catIndex = prodCategorySelect.value;
        const category = categories[catIndex];

        const newProduct = {
            id: Date.now(),
            name: document.getElementById('prodName').value,
            price: document.getElementById('prodPrice').value,
            image: document.getElementById('prodImage').value || 'https://via.placeholder.com/150',
            category: category.name,
            subCategory: category.subCategory,
            specs: {}
        };

        // Harvest dynamic fields
        document.querySelectorAll('.dynamic-field').forEach(input => {
            newProduct.specs[input.dataset.name] = input.value;
        });

        products.push(newProduct);
        await DataService.saveProducts(products);

        alert('Product Added Successfully!');
        productForm.reset();
        dynamicFieldsContainer.innerHTML = '';
        renderMyProducts();
    });
}

// Render Products
function renderMyProducts() {
    if (companyProductList) {
        companyProductList.innerHTML = products.map((prod, index) => `
            <div class="product-row">
                <img src="${prod.image}" alt="${prod.name}">
                <div>${prod.name}</div>
                <div>${prod.category}</div>
                <div style="color: var(--primary-color)">Rs. ${prod.price}</div>
                <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
            </div>
        `).join('');
    }
}

window.deleteProduct = async (index) => {
    if (confirm('Delete this product?')) {
        products.splice(index, 1);
        await DataService.saveProducts(products);
        renderMyProducts();
    }
};

// Navigation
window.showSection = (sectionId) => {
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
};

window.logout = () => {
    window.location.href = 'index.html';
};

// Init
async function initCompany() {
    try {
        [categories, products] = await Promise.all([
            DataService.getCategories(),
            DataService.getProducts()
        ]);

        loadCategories();
        renderMyProducts();
    } catch (error) {
        console.error("Failed to load company data:", error);
    }
}

window.addEventListener('load', initCompany);
