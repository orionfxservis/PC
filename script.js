// DOM Elements
const slides = document.querySelectorAll('.slide');

// UI Elements
const productGrid = document.getElementById('productGrid');
const searchCategory = document.getElementById('searchCategory');
const searchSubCategory = document.getElementById('searchSubCategory');
const searchProduct = document.getElementById('searchProduct');
const searchVariety = document.getElementById('searchVariety');
const catIcon = document.getElementById('catIcon');
const subCatIcon = document.getElementById('subCatIcon');
const productsSection = document.getElementById('products');
const locationStatus = document.getElementById('locationStatus');
const loginForm = document.getElementById('loginForm');

// Login Modal Elements
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeBtn = document.querySelector('.close');

// Deals Modal Elements
const dealsModal = document.getElementById('dealsModal');
const dealsBtn = document.getElementById('dealsBtn');
const closeDealsBtn = document.getElementById('closeDeals');

// Order Modal Elements
const orderModal = document.getElementById('orderModal');
const closeOrderBtn = document.getElementById('closeOrder');
const orderForm = document.getElementById('orderForm');
const orderQty = document.getElementById('orderQty');
const orderPrice = document.getElementById('orderPrice');
const orderTotal = document.getElementById('orderTotal');
const orderDateTime = document.getElementById('orderDateTime');
const orderProductName = document.getElementById('orderProductName');
const orderVendorWhatsapp = document.getElementById('orderVendorWhatsapp');


// State
let currentSlide = 0;
let userLocation = null;
let currentLoginType = 'user';
let products = [];
let deals = [];

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

// --- Modal Logic ---
loginBtn.onclick = function (e) {
    e.preventDefault();
    loginModal.style.display = "flex";
}

closeBtn.onclick = function () {
    loginModal.style.display = "none";
}

// Deals Modal Logic
dealsBtn.onclick = function (e) {
    e.preventDefault();
    dealsModal.style.display = "flex";
}

closeDealsBtn.onclick = function () {
    dealsModal.style.display = "none";
}

if (closeOrderBtn) {
    closeOrderBtn.onclick = function () {
        orderModal.style.display = "none";
    }
}

window.onclick = function (event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == dealsModal) {
        dealsModal.style.display = "none";
    }
    if (event.target == orderModal) {
        orderModal.style.display = "none";
    }
}

// Order Logic
window.openOrderModal = (name, price, whatsappUrl) => {
    if (!orderModal) return;
    orderModal.style.display = "flex";

    // Auto fill Date & Time
    const now = new Date();
    orderDateTime.value = now.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    // Auto fill Product
    orderProductName.value = name;

    // Extract numeric price
    const numericPrice = parseFloat(price.toString().replace(/,/g, '').replace(/Rs\.?\s*/i, ''));
    orderPrice.value = isNaN(numericPrice) ? 0 : numericPrice;
    orderQty.value = 1;

    orderVendorWhatsapp.value = whatsappUrl || '';

    window.calculateOrderTotal();
}

window.calculateOrderTotal = () => {
    const qty = parseInt(orderQty.value) || 1;
    const price = parseFloat(orderPrice.value) || 0;
    const total = qty * price;
    orderTotal.innerText = `Rs. ${total.toLocaleString()}`;
}

if (orderQty) {
    orderQty.addEventListener('input', window.calculateOrderTotal);
}

if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('orderPersonName').value;
        const contact = document.getElementById('orderContactNo').value;
        const userWhatsapp = document.getElementById('orderWhatsappNo').value;
        const address = document.getElementById('orderAddress').value;

        const pName = orderProductName.value;
        const pQty = orderQty.value;
        const pTotal = orderTotal.innerText;

        const msg = `*New Order Alert* 📦\n\n*Product:* ${pName}\n*Quantity:* ${pQty}\n*Total Price:* ${pTotal}\n\n*Customer Details:*\n*Name:* ${name}\n*Contact:* ${contact}\n*WhatsApp:* ${userWhatsapp}\n*Delivery Address:* ${address}`;

        const vendorWhatsapp = orderVendorWhatsapp.value;
        const adminPhone = '9233330360487'; // Main Admin WhatsApp No
        const adminUrl = 'https://wa.me/' + adminPhone + '?text=' + encodeURIComponent(msg);

        if (vendorWhatsapp && vendorWhatsapp !== '#') {
            const vendorUrl = vendorWhatsapp + '?text=' + encodeURIComponent(msg);

            // Open Vendor WhatsApp
            window.open(vendorUrl, '_blank');

            // Open Admin WhatsApp after a short delay
            setTimeout(() => {
                window.open(adminUrl, '_blank');
            }, 800);
        } else {
            // If no vendor, just send to admin
            window.open(adminUrl, '_blank');
        }
        orderModal.style.display = 'none';
        orderForm.reset();
    });
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
    productGrid.innerHTML = productsToRender.map((product, index) => {
        let details = product.subCategory || '';
        if (product.category === 'Vehicles' || product.category === 'Vehicle') {
            details = `${product.year || ''} Model ${product.condition ? '(' + product.condition + ')' : ''} | ${product.kMs || product.kms || 0} km`;
        } else if (product.category === 'Mobiles') {
            details = `${product.specification || ''} | ${product.batteryBackup ? product.batteryBackup + 'mAh' : ''}`;
        } else if (product.variety) {
            details += ` - ${product.variety}`;
        }

        const badge = index % 2 === 0 ? '🔥 Lowest Price' : '🔥 Hot Deal';
        const imgUrl = product.image && product.image.trim() !== '' ? product.image : 'images/product.jpg';
        const loc = product.location ? `📍 ${product.location}` : '📍 Available Now';
        const whatsappUrl = product.whatsapp ? 'https://wa.me/' + product.whatsapp.toString().replace(/[^0-9]/g, '') : '#';
        const displayedName = product.variety ? product.name + ' - ' + product.variety : product.name;
        const safeName = displayedName.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        return `
        <div class="product-card">
            <div class="badge">${badge}</div>
            <img src="${imgUrl}" alt="${product.name}">
            <h3>${displayedName}</h3>
            <p class="price">Rs. ${product.price}</p>
            <p class="location">${loc}</p>
            <p class="update">🕒 ${details || 'Recent Update'}</p>
            <div class="buttons">
                <button class="compare-btn">Compare</button>
                <button class="whatsapp-btn" onclick="openOrderModal('${safeName}', '${product.price}', '${whatsappUrl}')">Order Now</button>
            </div>
        </div>
        `;
    }).join('');
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

// Category Card Click Handler
window.setSearchCategory = (categoryName) => {
    if (searchCategory) {
        // Find if the category exists in the dropdown options
        let optionExists = false;
        for (let i = 0; i < searchCategory.options.length; i++) {
            if (searchCategory.options[i].value === categoryName) {
                optionExists = true;
                break;
            }
        }

        // Even if it doesn't currently exist in the database, we can set it so it shows 'No products found' properly
        if (!optionExists) {
            const newOption = new Option(categoryName, categoryName);
            searchCategory.add(newOption);
        }

        searchCategory.value = categoryName;
        // Trigger the change event manually to update subcategories and filter
        const event = new Event('change');
        searchCategory.dispatchEvent(event);

        // Scroll to the products section
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Render Deals dynamically
function renderDealsCards(dealsToRender) {
    const dealsGrid = document.querySelector('.deals-grid');
    if (!dealsGrid) return;

    if (!dealsToRender || dealsToRender.length === 0) {
        dealsGrid.innerHTML = '<p style="color:white; text-align:center; width:100%; grid-column: 1 / -1;">No active deals at the moment. Please check back later!</p>';
        return;
    }

    dealsGrid.innerHTML = dealsToRender.map(deal => {
        const whatsappLink = deal.whatsapp ? `https://wa.me/${deal.whatsapp.replace(/[^0-9]/g, '')}` : '#';

        return `
        <div class="deal-card">
            ${deal.badge ? `<div class="deal-badge">${deal.badge}</div>` : ''}
            <img src="${deal.image}" alt="${deal.name}">
            <div class="deal-info">
                <h3>${deal.name}</h3>
                <p class="deal-desc">${deal.desc || ''}</p>
                <div class="deal-price-loc">
                    <span class="deal-price">${deal.price || ''}</span>
                    <span class="deal-location"><i class="fa-solid fa-location-dot"></i> ${deal.location || ''}</span>
                </div>
                <div class="deal-actions">
                    ${deal.whatsapp ? `<a href="${whatsappLink}" target="_blank" class="btn-whatsapp"><i class="fa-brands fa-whatsapp"></i> Chat</a>` : ''}
                    ${deal.video ? `<a href="${deal.video}" target="_blank" class="btn-video"><i class="fa-brands fa-tiktok"></i> Video</a>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Init
async function init() {
    checkLocation();

    // Initially hide the products section
    if (productsSection) productsSection.style.display = 'none';

    try {
        const [loadedProducts, loadedDeals] = await Promise.all([
            DataService.getProducts(),
            DataService.getDeals()
        ]);

        products = loadedProducts;
        deals = loadedDeals;

        initSearchDropdowns();
        renderDealsCards(deals);
    } catch (error) {
        console.error("Failed to load initial data:", error);
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
