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
        const uniqueCategories = [...new Set(categories.map(c => c.name))];
        prodCategorySelect.innerHTML = '<option value="">Select Category</option>' +
            uniqueCategories.map(name => `<option value="${name}">${name}</option>`).join('');
    }
}

// Load Sub Categories based on Category
window.loadSubCategories = () => {
    const selectedCat = prodCategorySelect.value;
    const prodSubCategorySelect = document.getElementById('prodSubCategory');
    dynamicFieldsContainer.innerHTML = ''; // clear dynamic fields

    if (prodSubCategorySelect) {
        if (!selectedCat) {
            prodSubCategorySelect.innerHTML = '<option value="">Select Sub Category</option>';
            return;
        }

        const relevantCats = categories.filter(c => c.name === selectedCat);
        let subCats = [];
        relevantCats.forEach(cat => {
            if (cat.subCategory) {
                subCats.push(...cat.subCategory.split(',').map(s => s.trim()).filter(s => s));
            }
        });
        const uniqueSubCats = [...new Set(subCats)];

        prodSubCategorySelect.innerHTML = '<option value="">Select Sub Category</option>' +
            uniqueSubCats.map(sub => `<option value="${sub}">${sub}</option>`).join('');
    }
};

// Load Dynamic Fields based on Category
window.loadCategoryFields = () => {
    const selectedCat = prodCategorySelect.value;
    const selectedSubCat = document.getElementById('prodSubCategory').value;
    dynamicFieldsContainer.innerHTML = '';

    if (!selectedCat || !selectedSubCat) return;

    // We look for a matching category object in our original array to find its fields.
    const category = categories.find(c => c.name === selectedCat && c.subCategory.includes(selectedSubCat)) || categories.find(c => c.name === selectedCat);
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

        const selectedCatName = prodCategorySelect.value;
        const selectedSubCatName = document.getElementById('prodSubCategory').value;

        const newProduct = {
            id: Date.now(),
            name: document.getElementById('prodName').value,
            price: document.getElementById('prodPrice').value,
            image: document.getElementById('prodImage').value || 'https://via.placeholder.com/150',
            category: selectedCatName,
            subCategory: selectedSubCatName,
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
