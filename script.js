// DOM Elements
const slides = document.querySelectorAll('.slide');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const locationStatus = document.getElementById('locationStatus');
const productGrid = document.getElementById('productGrid');
const searchCategory = document.getElementById('searchCategory');
const searchSubCategory = document.getElementById('searchSubCategory');
const searchProduct = document.getElementById('searchProduct');
const searchVariety = document.getElementById('searchVariety');
const catIcon = document.getElementById('catIcon');
const productsSection = document.getElementById('products');

// State
let currentSlide = 0;
let userLocation = null;
let currentLoginType = 'user';
let products = [];

// Slider Logic
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(nextSlide, 5000); // Change slide every 5 seconds

// Location Logic
function checkLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationStatus.textContent = "Location Active: Finding nearest deals...";
                locationStatus.style.color = "#4cc9f0"; // Success color
            },
            (error) => {
                locationStatus.textContent = "Please Turn On Your Location to find deals near you.";
                locationStatus.style.color = "#ff006e"; // Error color
                alert("Please turn on your location to get the best experience!");
            }
        );
    } else {
        locationStatus.textContent = "Geolocation not supported";
    }
}

// Modal Logic
loginBtn.onclick = () => loginModal.style.display = "flex";
closeBtn.onclick = () => loginModal.style.display = "none";
window.onclick = (e) => {
    if (e.target == loginModal) loginModal.style.display = "none";
}

// Login Tab Logic
window.openLoginTab = (type) => { // Attach to window for HTML access
    currentLoginType = type;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update UI based on type if needed (e.g., different fields)
    console.log(`Switched login to: ${type}`);
};

// Login Logic
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('loginMessage');

    message.textContent = "Logging in...";
    message.style.color = "#fff";

    try {
        const result = await DataService.login(username, password, currentLoginType);

        if (result.success) {
            message.textContent = "Login Successful!";
            message.style.color = "#4cc9f0";

            setTimeout(() => {
                if (currentLoginType === 'admin') {
                    window.location.href = 'admin.html';
                } else if (currentLoginType === 'company') {
                    window.location.href = 'company.html';
                } else {
                    message.textContent = "User Login Successful (Demo Mode)";
                    loginModal.style.display = "none";
                }
            }, 1000);
        } else {
            message.textContent = result.message || "Invalid Credentials";
            message.style.color = "#ff006e";
        }
    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "An error occurred during login.";
        message.style.color = "#ff006e";
    }
});

// Render Products
function renderProducts(productsToRender) {
    if (!productsToRender || productsToRender.length === 0) {
        productsSection.style.display = 'none';
        productGrid.innerHTML = '';
        return;
    }

    productsSection.style.display = 'block';
    productGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">Rs. ${product.price}</p>
            </div>
        </div>
    `).join('');
}

// Search Dropdown Logic
const categoryIcons = {
    'Food': 'fa-utensils',
    'Electronics': 'fa-laptop',
    'Vehicles': 'fa-car',
    'Clothing': 'fa-shirt',
    'default': 'fa-list' // Fallback
};

function initSearchDropdowns() {
    if (!searchCategory) return;

    // Populate Categories
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(c => c))];
    searchCategory.innerHTML = '<option value="">Select Category...</option>' +
        uniqueCategories.map(c => `<option value="${c}">${c}</option>`).join('');

    searchCategory.addEventListener('change', () => {
        const cat = searchCategory.value;
        searchSubCategory.innerHTML = '<option value="">Select Item Type...</option>';
        searchProduct.innerHTML = '<option value="">Select Product Type...</option>';
        searchVariety.innerHTML = '<option value="">Select Variety...</option>';

        searchSubCategory.disabled = !cat;
        searchProduct.disabled = true;
        searchVariety.disabled = true;

        if (cat) {
            // Update icon
            if (catIcon) catIcon.className = 'fa-solid ' + (categoryIcons[cat] || categoryIcons['default']);

            const subCatIcon = document.getElementById('subCatIcon');
            if (subCatIcon) {
                if (cat === 'Food') {
                    subCatIcon.className = 'fa-solid fa-list-alt'; // Menu Card look
                } else {
                    subCatIcon.className = 'fa-solid fa-list';
                }
            }

            // Populate subcategories
            const relevantProducts = products.filter(p => p.category === cat);
            const uniqueSubCats = [...new Set(relevantProducts.map(p => p.subCategory).filter(s => s))];
            searchSubCategory.innerHTML += uniqueSubCats.map(sc => `<option value="${sc}">${sc}</option>`).join('');
        } else {
            if (catIcon) catIcon.className = 'fa-solid fa-list';
            const subCatIcon = document.getElementById('subCatIcon');
            if (subCatIcon) subCatIcon.className = 'fa-solid fa-list';
        }
        filterProducts();
    });

    searchSubCategory.addEventListener('change', () => {
        const cat = searchCategory.value;
        const subCat = searchSubCategory.value;

        searchProduct.innerHTML = '<option value="">Select Product Type...</option>';
        searchVariety.innerHTML = '<option value="">Select Variety...</option>';

        searchProduct.disabled = !subCat;
        searchVariety.disabled = true;

        if (subCat) {
            const relevantProducts = products.filter(p => p.category === cat && p.subCategory === subCat);
            const uniqueProductNames = [...new Set(relevantProducts.map(p => p.name).filter(n => n))];
            searchProduct.innerHTML += uniqueProductNames.map(n => `<option value="${n}">${n}</option>`).join('');
        }
        filterProducts();
    });

    searchProduct.addEventListener('change', () => {
        const cat = searchCategory.value;
        const subCat = searchSubCategory.value;
        const prodName = searchProduct.value;

        searchVariety.innerHTML = '<option value="">Select Variety...</option>';
        searchVariety.disabled = !prodName;

        if (prodName) {
            const relevantProducts = products.filter(p => p.category === cat && p.subCategory === subCat && p.name === prodName);
            const uniqueVarieties = [...new Set(relevantProducts.map(p => p.variety).filter(v => v))];
            if (uniqueVarieties.length > 0) {
                searchVariety.innerHTML += uniqueVarieties.map(v => `<option value="${v}">${v}</option>`).join('');
            } else {
                searchVariety.disabled = true; // No varieties for this product
            }
        }
        filterProducts();
    });

    searchVariety.addEventListener('change', filterProducts);
}

function filterProducts() {
    const cat = searchCategory.value;
    const subCat = searchSubCategory.value;
    const prodName = searchProduct.value;
    const variety = searchVariety.value;

    if (!cat && !subCat && !prodName && !variety) {
        renderProducts([]); // Hide if empty
        return;
    }

    let filtered = products;
    if (cat) filtered = filtered.filter(p => p.category === cat);
    if (subCat) filtered = filtered.filter(p => p.subCategory === subCat);
    if (prodName) filtered = filtered.filter(p => p.name === prodName);
    if (variety) filtered = filtered.filter(p => p.variety === variety);

    if (filtered.length === 0) {
        productsSection.style.display = 'block';
        productGrid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No products found for this selection.</p>';
    } else {
        renderProducts(filtered);
    }
}

// Init
async function init() {
    checkLocation();

    // Initially hide the products section
    if (productsSection) productsSection.style.display = 'none';

    try {
        products = await DataService.getProducts();
        initSearchDropdowns();
    } catch (error) {
        console.error("Failed to load products:", error);
    }
}

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

window.addEventListener('load', init);
