/**
 * DataService - Abstraction layer for data operations.
 * Automatically switches between localStorage (dev) and Google Apps Script (prod).
 */

const DataService = {
    isGAS: typeof google !== 'undefined' && google.script && google.script.run,

    // --- Helpers ---

    _promisify: (fnName, ...args) => {
        return new Promise((resolve, reject) => {
            if (!DataService.isGAS) {
                console.error(`GAS not available for ${fnName}`);
                reject('GAS not available');
                return;
            }
            google.script.run
                .withSuccessHandler(resolve)
                .withFailureHandler(reject)
            [fnName](...args);
        });
    },

    // --- Products ---

    getProducts: async () => {
        if (DataService.isGAS) {
            return await DataService._promisify('getProducts');
        } else {
            return JSON.parse(localStorage.getItem('products')) || [];
        }
    },

    saveProducts: async (products) => {
        if (DataService.isGAS) {
            return await DataService._promisify('saveProducts', products);
        } else {
            localStorage.setItem('products', JSON.stringify(products));
            return 'Success';
        }
    },

    // --- Categories ---

    getCategories: async () => {
        if (DataService.isGAS) {
            return await DataService._promisify('getCategories');
        } else {
            return JSON.parse(localStorage.getItem('categories')) || [];
        }
    },

    saveCategories: async (categories) => {
        if (DataService.isGAS) {
            return await DataService._promisify('saveCategories', categories);
        } else {
            localStorage.setItem('categories', JSON.stringify(categories));
            return 'Success';
        }
    },

    // --- Banners ---

    getBanners: async () => {
        if (DataService.isGAS) {
            return await DataService._promisify('getBanners');
        } else {
            return JSON.parse(localStorage.getItem('banners')) || [];
        }
    },

    saveBanners: async (banners) => {
        if (DataService.isGAS) {
            return await DataService._promisify('saveBanners', banners);
        } else {
            localStorage.setItem('banners', JSON.stringify(banners));
            return 'Success';
        }
    },

    // --- Users / Auth ---

    // Note: For now, we are simulating login locally or using GAS backend
    login: async (username, password, type) => {
        if (DataService.isGAS) {
            return await DataService._promisify('loginUser', username, password, type);
        } else {
            // Mock Local Login Logic (replicating logic from script.js)
            if (type === 'admin') {
                if ((username === 'Faisal' && password === '1234') ||
                    (username === 'Ashraf' && password === '1234')) {
                    return { success: true, user: { username, role: 'admin' } };
                }
            } else if (type === 'company') {
                // Any login works for company demo locally
                return { success: true, user: { username, role: 'company' } };
            } else {
                return { success: true, user: { username, role: 'user' } };
            }
            return { success: false, message: 'Invalid credentials' };
        }
    }
};
