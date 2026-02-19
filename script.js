// DOM Elements
const slides = document.querySelectorAll('.slide');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const locationStatus = document.getElementById('locationStatus');
const productGrid = document.getElementById('productGrid');

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
function renderProducts() {
    if (products.length === 0) {
        productGrid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">No products found.</p>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">Rs. ${product.price}</p>
            </div>
        </div>
    `).join('');
}

// Init
async function init() {
    checkLocation();
    try {
        products = await DataService.getProducts();
        renderProducts();
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
