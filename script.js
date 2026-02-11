// Mock Data with 3 Levels: Main Category -> Sub Category -> Item Type -> Products
const foodData = {
    "Food": {
        "Fast Food": {
            "Burger": [
                { id: 301, name: "Zinger Burger", price: "350", origin: "Chef Special", freshness: "Hot & Crispy" },
                { id: 302, name: "Beef Burger", price: "400", origin: "Grill House", freshness: "Juicy" }
            ],
            "Club Sandwich": [
                { id: 303, name: "Club Sandwich", price: "300", origin: "Classic Layer", freshness: "Toasted" },
                { id: 304, name: "BBQ Sandwich", price: "350", origin: "Smokehouse", freshness: "Smoky" }
            ],
            "Broast": [
                { id: 305, name: "Chicken Broast (Qtr)", price: "450", origin: "Crispy Fry", freshness: "Golden" },
                { id: 306, name: "Spicy Broast", price: "480", origin: "Hot & Spicy", freshness: "Fresh Fried" }
            ],
            "Pizza": [
                { id: 307, name: "Chicken Fajita", price: "1200", origin: "Italiano", freshness: "Cheesy" },
                { id: 308, name: "Pepperoni", price: "1300", origin: "NY Style", freshness: "Hot" }
            ]
        },
        "Desi Cuisine": {
            "Biryani": [
                { id: 401, name: "Chicken Biryani", price: "300", origin: "Karachi Spice", freshness: "Steaming Hot" },
                { id: 402, name: "Beef Biryani", price: "400", origin: "Traditional", freshness: "Aromatic" }
            ],
            "Haleem": [
                { id: 403, name: "Special Haleem", price: "250", origin: "Slow Cooked", freshness: "Garnished" },
                { id: 404, name: "Shahi Haleem", price: "350", origin: "Royal Recipe", freshness: "Premium" }
            ],
            "Karahi": [
                { id: 405, name: "Chicken Karahi", price: "1500", origin: "Peshawari", freshness: "Fresh Made" }
            ]
        }
    },
    "Electronics": {
        "Mobile Phones": {
            "Apple": [
                { id: 501, name: "iPhone 15 Pro", price: "450000", origin: "USA", freshness: "Brand New" },
                { id: 502, name: "iPhone 14", price: "250000", origin: "USA", freshness: "Refurbished" }
            ],
            "Samsung": [
                { id: 503, name: "Galaxy S24 Ultra", price: "400000", origin: "Korea", freshness: "Brand New" },
                { id: 504, name: "Galaxy A55", price: "120000", origin: "Vietnam", freshness: "New" }
            ]
        },
        "Laptops": {
            "Gaming": [
                { id: 505, name: "ASUS ROG Strix", price: "600000", origin: "Taiwan", freshness: "High Perf" },
                { id: 506, name: "MSI Raider", price: "550000", origin: "China", freshness: "RGB" }
            ],
            "Business": [
                { id: 507, name: "MacBook Air M3", price: "350000", origin: "USA", freshness: "Sleek" },
                { id: 508, name: "Dell XPS 13", price: "320000", origin: "USA", freshness: "Ultrabook" }
            ]
        }
    },
    "Cars": {
        "Sedan": {
            "Toyota": [
                { id: 601, name: "Corolla Altis", price: "7500000", origin: "Japan/Local", freshness: "New 2025" },
                { id: 602, name: "Yaris", price: "5500000", origin: "Local", freshness: "New 2024" }
            ],
            "Honda": [
                { id: 603, name: "Civic RS", price: "9500000", origin: "Local", freshness: "Turbo" },
                { id: 604, name: "City", price: "5800000", origin: "Local", freshness: "Comfort" }
            ]
        },
        "SUV": {
            "KIA": [
                { id: 605, name: "Sportage AWD", price: "8500000", origin: "Korea/Local", freshness: "Popular" },
                { id: 606, name: "Sorento", price: "11000000", origin: "Korea", freshness: "7 Seater" }
            ],
            "Hyundai": [
                { id: 607, name: "Tucson", price: "8200000", origin: "Korea/Local", freshness: "Modern" }
            ]
        }
    },
    "Cloths": {
        "Men": {
            "Formal": [
                { id: 701, name: "3-Piece Suit", price: "25000", origin: "Italian Fabric", freshness: "Tailored" },
                { id: 702, name: "Cotton Shirt", price: "3500", origin: "Local Brand", freshness: "Crisp" }
            ],
            "Casual": [
                { id: 703, name: "Denim Jeans", price: "4000", origin: "Export Quality", freshness: "Rugged" },
                { id: 704, name: "Polo T-Shirt", price: "2000", origin: "Cotton", freshness: "Soft" }
            ]
        },
        "Women": {
            "Eastern": [
                { id: 705, name: "Embroidered Kurti", price: "5000", origin: "Designer", freshness: "Chic" },
                { id: 706, name: "3-Piece Lawn", price: "6500", origin: "Summer Collection", freshness: "Vibrant" }
            ],
            "Western": [
                { id: 707, name: "Maxi Dress", price: "8000", origin: "Imported", freshness: "Elegant" },
                { id: 708, name: "Leather Jacket", price: "12000", origin: "Genuine Leather", freshness: "Stylish" }
            ]
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const mainCategorySelect = document.getElementById('main-category');
    const subCategorySelect = document.getElementById('sub-category');
    const itemTypeSelect = document.getElementById('item-type');

    const subCategoryGroup = document.getElementById('sub-category-group');
    const itemTypeGroup = document.getElementById('item-type-group');

    const productDisplay = document.getElementById('product-display');
    const productGrid = document.getElementById('product-grid');
    const actionBar = document.getElementById('action-bar');
    const selectedCountSpan = document.getElementById('selected-count');
    const btnConfirm = document.getElementById('btn-confirm');

    let selectedItems = new Set();

    // Populate Main Categories
    for (const category in foodData) {
        if (category === "dummymode") continue;
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        mainCategorySelect.appendChild(option);
    }

    // Main Category Change Listener
    mainCategorySelect.addEventListener('change', (e) => {
        const selectedMain = e.target.value;
        const subCategories = foodData[selectedMain];

        // Reset Sub Category & Item Type
        resetSelect(subCategorySelect, "Select Sub Category...");
        resetSelect(itemTypeSelect, "Select Product Type...");

        subCategoryGroup.classList.remove('disabled');
        itemTypeGroup.classList.add('disabled');

        // Hide products
        productDisplay.classList.remove('visible');
        actionBar.classList.remove('visible');
        selectedItems.clear();
        updateSelectionUI();

        // Populate Sub Category
        for (const sub in subCategories) {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subCategorySelect.appendChild(option);
        }
    });

    // Sub Category Change Listener
    subCategorySelect.addEventListener('change', (e) => {
        const mainCat = mainCategorySelect.value;
        const subCat = e.target.value;
        const itemTypes = foodData[mainCat][subCat];

        // Reset Item Type
        resetSelect(itemTypeSelect, "Select Product Type...");
        itemTypeGroup.classList.remove('disabled');

        // Hide products
        productDisplay.classList.remove('visible');

        // Populate Item Types
        for (const type in itemTypes) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            itemTypeSelect.appendChild(option);
        }
    });

    // Item Type Change Listener
    itemTypeSelect.addEventListener('change', (e) => {
        const mainCat = mainCategorySelect.value;
        const subCat = subCategorySelect.value;
        const itemType = e.target.value;

        const products = foodData[mainCat][subCat][itemType];
        displayProducts(products);
    });

    function resetSelect(selectElement, defaultText) {
        selectElement.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;
        selectElement.disabled = false;
    }

    // Detail Modal Elements
    const detailModal = document.getElementById('product-detail-modal');
    const closeDetail = document.querySelector('.close-detail-modal');
    const detailName = document.getElementById('detail-name');
    const detailPrice = document.getElementById('detail-price');
    const detailOrigin = document.getElementById('detail-origin');
    const detailFreshness = document.getElementById('detail-freshness');
    const btnDetailConfirm = document.getElementById('btn-detail-confirm');
    let currentDetailItem = null;

    // Entry Form Elements
    const entryModal = document.getElementById('product-entry-modal');
    const closeEntry = document.querySelector('.close-entry-modal');
    const btnOpenEntry = document.getElementById('btn-open-entry');
    const entryForm = document.getElementById('product-entry-form');

    // Entry Form Dropdowns
    const entryCategory = document.getElementById('entry-category');
    const entrySubCategory = document.getElementById('entry-sub-category');
    const entryItemType = document.getElementById('entry-item-type');

    function displayProducts(products) {
        productGrid.innerHTML = '';
        productDisplay.classList.add('visible');

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;

            // Click on card body opens details
            card.onclick = (e) => openProductDetail(product);

            card.innerHTML = `
                <div class="checkbox-overlay">
                    <input type="checkbox" ${selectedItems.has(product.id) ? 'checked' : ''} readonly>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">Rs. ${product.price}</div>
                    <div class="product-details">
                        <p><strong>Type:</strong> ${product.origin}</p>
                        <p><strong>Freshness:</strong> ${product.freshness}</p>
                    </div>
                </div>
            `;

            // Attach click event to checkbox container specifically for selection
            const checkboxOverlay = card.querySelector('.checkbox-overlay');
            checkboxOverlay.onclick = (e) => {
                e.stopPropagation(); // Stop bubbling to card click
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

    // --- Product Detail Logic ---
    const detailImage = document.getElementById('detail-image');

    function getProductImage(product) {
        // Simple keyword matching for demo images
        const name = product.name.toLowerCase();
        if (name.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop';
        if (name.includes('pizza')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop';
        if (name.includes('sandwich')) return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=600&auto=format&fit=crop';
        if (name.includes('broast') || name.includes('chicken')) return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop';
        if (name.includes('biryani')) return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=600&auto=format&fit=crop';
        if (name.includes('haleem')) return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop';
        if (name.includes('iphone')) return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop';
        if (name.includes('sams')) return 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop';
        if (name.includes('lap') || name.includes('mac') || name.includes('dell')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600&auto=format&fit=crop';
        if (name.includes('corolla') || name.includes('yaris')) return 'https://images.unsplash.com/photo-1623869675785-004a8b0e454b?q=80&w=600&auto=format&fit=crop';
        if (name.includes('civic') || name.includes('city')) return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=600&auto=format&fit=crop';
        if (name.includes('kia') || name.includes('sportage')) return 'https://images.unsplash.com/photo-1606552251347-49525143093b?q=80&w=600&auto=format&fit=crop';
        if (name.includes('shirt') || name.includes('suit')) return 'https://images.unsplash.com/photo-1594938298603-c8148c47e356?q=80&w=600&auto=format&fit=crop';
        if (name.includes('dress') || name.includes('kurti')) return 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop';

        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'; // Default Food
    }

    function openProductDetail(product) {
        currentDetailItem = product;

        // Update Image
        detailImage.src = getProductImage(product);

        detailName.textContent = product.name;
        detailPrice.textContent = `Rs. ${product.price}`;
        detailOrigin.textContent = product.origin;
        detailFreshness.textContent = product.freshness;

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

    // --- Product Entry Form Logic ---

    // Open/Close Entry Modal
    btnOpenEntry.addEventListener('click', () => {
        entryModal.classList.remove('hidden');
        entryModal.classList.add('visible');
    });

    closeEntry.addEventListener('click', () => {
        entryModal.classList.add('hidden');
        entryModal.classList.remove('visible');
    });

    // Populate Entry Category
    for (const category in foodData) {
        if (category === "dummymode") continue;
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        entryCategory.appendChild(option);
    }

    // Configuration for dynamic field labels
    const categoryFieldConfig = {
        "Food": { brand: "Restaurant / Brand", size: "Portion / Qty" },
        "Electronics": { brand: "Brand", size: "Storage / Variant" },
        "Cars": { brand: "Make / Company", size: "Model Year" },
        "Cloths": { brand: "Brand", size: "Size (S/M/L/XL)" }
    };

    // Dynamic Logic for Entry Form (Same structure as main search)
    entryCategory.addEventListener('change', (e) => {
        const selectedMain = e.target.value;
        const subCategories = foodData[selectedMain];

        // Update Labels based on config
        const config = categoryFieldConfig[selectedMain];
        if (config) {
            document.querySelector('label[for="entry-brand"]').textContent = config.brand;
            document.getElementById('entry-brand').placeholder = `e.g. ${config.brand}...`;

            document.querySelector('label[for="entry-size"]').textContent = config.size;
            document.getElementById('entry-size').placeholder = `e.g. ${config.size}...`;
        }

        entrySubCategory.innerHTML = '<option value="" disabled selected>Select Sub Category</option>';
        entryItemType.innerHTML = '<option value="" disabled selected>Select Product Type</option>';

        entrySubCategory.disabled = false;
        entryItemType.disabled = true;

        for (const sub in subCategories) {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            entrySubCategory.appendChild(option);
        }
    });

    entrySubCategory.addEventListener('change', (e) => {
        const mainCat = entryCategory.value;
        const subCat = e.target.value;
        const itemTypes = foodData[mainCat][subCat];

        entryItemType.innerHTML = '<option value="" disabled selected>Select Product Type</option>';
        entryItemType.disabled = false;

        for (const type in itemTypes) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            entryItemType.appendChild(option);
        }
    });

    // Form Submit
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("New product added successfully!\n(This is a prototype demo)");
        entryModal.classList.add('hidden');
        entryModal.classList.remove('visible');
        entryForm.reset();
    });

    // Close Modals on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target == detailModal) {
            detailModal.classList.add('hidden');
            detailModal.classList.remove('visible');
        }
        if (e.target == entryModal) {
            entryModal.classList.add('hidden');
            entryModal.classList.remove('visible');
        }
        // Comparison modal logic remains check above or duplicated here if needed
        if (e.target == comparisonModal) {
            comparisonModal.classList.add('hidden');
            comparisonModal.classList.remove('visible');
        }
    });

    function updateSelectionUI() {
        selectedCountSpan.textContent = selectedItems.size;

        if (selectedItems.size > 0) {
            actionBar.classList.add('visible');
        } else {
            actionBar.classList.remove('visible');
        }
    }

    const comparisonModal = document.getElementById('comparison-modal');
    const comparisonContainer = document.getElementById('comparison-container');
    const closeStart = document.querySelector('.close-modal');

    btnConfirm.addEventListener('click', () => {
        if (selectedItems.size === 0) {
            alert("Please select at least one item to confirm order.");
            return;
        }
        alert(`Order Confirmed for ${selectedItems.size} items! \n(This is a prototype demo)`);
    });

    const btnCompare = document.getElementById('btn-compare');

    btnCompare.addEventListener('click', () => {
        if (selectedItems.size < 2) {
            alert("Please select at least 2 items to compare.");
            return;
        }

        comparisonContainer.innerHTML = '';
        const itemsToCompare = [];

        // Brute-force find items (since structure is nested, flattened search is easiest)
        const allProducts = [];
        for (const main in foodData) {
            if (main == "dummymode") continue;
            for (const sub in foodData[main]) {
                for (const type in foodData[main][sub]) {
                    foodData[main][sub][type].forEach(p => allProducts.push(p));
                }
            }
        }

        allProducts.forEach(item => {
            if (selectedItems.has(item.id)) {
                itemsToCompare.push(item);
            }
        });

        // Create Comparison Table/Grid
        itemsToCompare.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'comparison-item';
            // Added currency formatting
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p class="price">Rs. ${item.price}</p>
                <div class="details">
                    <p><strong>Type:</strong> <br>${item.origin}</p>
                    <p><strong>Freshness:</strong> <br>${item.freshness}</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="confirmSingleOrder(${item.id}, '${item.name}')">Select</button>
            `;
            comparisonContainer.appendChild(itemDiv);
        });

        comparisonModal.classList.remove('hidden');
        comparisonModal.classList.add('visible');
    });

    closeStart.addEventListener('click', () => {
        comparisonModal.classList.add('hidden');
        comparisonModal.classList.remove('visible');
    });

    // Expose function to window for the button onclick
    window.confirmSingleOrder = (id, name) => {
        alert(`You have selected: ${name} to confirm your order!`);
        comparisonModal.classList.add('hidden');
        comparisonModal.classList.remove('visible');
        // Reset selection if desired, or keep as is
    };
});
