// Main Application JavaScript
class CampusKart {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.items = this.getItems();
        this.filteredItems = [...this.items];
        this.currentView = 'all';
        
        this.initializeApp();
    }

    initializeApp() {
        this.checkAuthStatus();
        this.initializeEventListeners();
        this.setupUserInterface();
        this.renderItems();
        this.initializeSampleData();
    }

    checkAuthStatus() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('campuskart_current_user') || 'null');
    }

    getItems() {
        return JSON.parse(localStorage.getItem('campuskart_items') || '[]');
    }

    saveItems() {
        localStorage.setItem('campuskart_items', JSON.stringify(this.items));
    }

    setupUserInterface() {
        // Update user name in navbar
        const userNameEl = document.getElementById('userName');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.name;
        }

        // Show post item button only for sellers
        const postBtns = document.querySelectorAll('#postItemBtn, #heroPostBtn, #footerPostBtn');
        postBtns.forEach(btn => {
            if (this.currentUser.role === 'both') {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
    }

    initializeEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Modal controls
        this.setupModals();
        
        // Form handling
        this.setupForms();
        
        // Search and filters
        this.setupSearchAndFilters();
        
        // View toggles
        this.setupViewToggles();
        
        // Hero buttons
        this.setupHeroButtons();
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    setupNavigation() {
        // Mobile hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        hamburger?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
                navMenu?.classList.remove('active');
            }
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                navMenu?.classList.remove('active');
            });
        });
    }

    setupModals() {
        const addItemModal = document.getElementById('addItemModal');
        const contactModal = document.getElementById('contactModal');
        const closeButtons = document.querySelectorAll('.close-btn');

        // Post item buttons
        document.querySelectorAll('#postItemBtn, #heroPostBtn, #footerPostBtn').forEach(btn => {
            btn?.addEventListener('click', () => {
                if (this.currentUser.role === 'both') {
                    this.openModal('addItemModal');
                } else {
                    this.showNotification('Only sellers can post items. Please update your account.', 'info');
                }
            });
        });

        // Close modal buttons
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Close modal when clicking outside
        [addItemModal, contactModal].forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupForms() {
        // Add item form
        const addItemForm = document.getElementById('addItemForm');
        addItemForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddItem();
        });

        // Image upload
        const imageInput = document.getElementById('itemImage');
        const imagePreview = document.getElementById('imagePreview');
        
        imageInput?.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // Mode change handling
        const modeSelect = document.getElementById('itemMode');
        modeSelect?.addEventListener('change', (e) => {
            const priceGroup = document.getElementById('priceGroup');
            if (e.target.value === 'donate') {
                priceGroup.style.display = 'none';
                document.getElementById('itemPrice').value = '';
            } else {
                priceGroup.style.display = 'block';
            }
        });
    }

    setupSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const modeFilter = document.getElementById('modeFilter');
        const clearFilters = document.getElementById('clearFilters');

        searchInput?.addEventListener('input', () => {
            this.applyFilters();
        });

        categoryFilter?.addEventListener('change', () => {
            this.applyFilters();
        });

        modeFilter?.addEventListener('change', () => {
            this.applyFilters();
        });

        clearFilters?.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = '';
            modeFilter.value = '';
            this.applyFilters();
        });
    }

    setupViewToggles() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Free items button
        document.getElementById('freeItemsBtn')?.addEventListener('click', () => {
            this.switchView('free');
            document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        document.getElementById('footerFreeBtn')?.addEventListener('click', () => {
            this.switchView('free');
            document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    setupHeroButtons() {
        document.getElementById('heroBrowseBtn')?.addEventListener('click', () => {
            document.querySelector('.marketplace')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    handleImageUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        const imagePreview = document.getElementById('imagePreview');

        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            imagePreview.setAttribute('data-image', e.target.result);
        };

        reader.readAsDataURL(file);
    }

    handleAddItem() {
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const mode = document.getElementById('itemMode').value;
        const price = document.getElementById('itemPrice').value;
        const description = document.getElementById('itemDescription').value.trim();
        const imagePreview = document.getElementById('imagePreview');
        const image = imagePreview.getAttribute('data-image');

        // Validation
        if (!name || !category || !mode) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (mode !== 'donate' && (!price || price <= 0)) {
            this.showNotification('Please enter a valid price', 'error');
            return;
        }

        // Create new item
        const newItem = {
            id: Date.now().toString(),
            name,
            category,
            mode,
            price: mode === 'donate' ? 0 : parseFloat(price),
            description,
            image: image || null,
            sellerId: this.currentUser.id,
            sellerName: this.currentUser.name,
            sellerCollege: this.currentUser.college,
            sellerEmail: this.currentUser.email,
            createdAt: new Date().toISOString()
        };

        this.items.push(newItem);
        this.saveItems();
        this.applyFilters();
        this.closeModal('addItemModal');
        this.resetAddItemForm();
        
        this.showNotification('Item added successfully!', 'success');
    }

    resetAddItemForm() {
        document.getElementById('addItemForm').reset();
        document.getElementById('imagePreview').innerHTML = `
            <i class="fas fa-camera"></i>
            <p>Click to upload image</p>
        `;
        document.getElementById('imagePreview').removeAttribute('data-image');
        document.getElementById('priceGroup').style.display = 'block';
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const modeFilter = document.getElementById('modeFilter')?.value || '';

        this.filteredItems = this.items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                                item.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesMode = !modeFilter || item.mode === modeFilter;
            const matchesView = this.currentView === 'all' || 
                              (this.currentView === 'free' && (item.mode === 'donate' || item.mode === 'borrow'));

            return matchesSearch && matchesCategory && matchesMode && matchesView;
        });

        this.renderItems();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

        this.applyFilters();
    }

    renderItems() {
        const itemsGrid = document.getElementById('itemsGrid');
        const noItems = document.getElementById('noItems');

        if (!itemsGrid) return;

        if (this.filteredItems.length === 0) {
            itemsGrid.style.display = 'none';
            noItems.style.display = 'block';
            return;
        }

        itemsGrid.style.display = 'grid';
        noItems.style.display = 'none';

        itemsGrid.innerHTML = this.filteredItems.map(item => this.createItemCard(item)).join('');

        // Add click listeners to contact buttons
        document.querySelectorAll('.contact-seller-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.openContactModal(item);
                }
            });
        });
    }

    createItemCard(item) {
        const priceDisplay = item.mode === 'donate' ? 
            '<div class="item-price free">FREE</div>' :
            item.mode === 'borrow' ?
            '<div class="item-price free">BORROW</div>' :
            `<div class="item-price">$${item.price.toFixed(2)}</div>`;

        const imageDisplay = item.image ?
            `<img src="${item.image}" alt="${item.name}">` :
            '<i class="fas fa-image"></i>';

        return `
            <div class="item-card">
                <div class="item-image">
                    ${imageDisplay}
                </div>
                <div class="item-content">
                    <div class="item-header">
                        <h3 class="item-title">${item.name}</h3>
                        <div class="item-badges">
                            <span class="badge category">${this.getCategoryName(item.category)}</span>
                            <span class="badge mode-${item.mode}">${this.getModeName(item.mode)}</span>
                        </div>
                    </div>
                    ${priceDisplay}
                    ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                    <button class="contact-seller-btn" data-item-id="${item.id}">
                        <i class="fas fa-envelope"></i> Contact Seller
                    </button>
                </div>
            </div>
        `;
    }

    getCategoryName(category) {
        const names = {
            'stationery': 'Stationery',
            'lab': 'Lab Items',
            'tech': 'Tech',
            'books': 'Books',
            'misc': 'Misc'
        };
        return names[category] || category;
    }

    getModeName(mode) {
        const names = {
            'buy': 'For Sale',
            'borrow': 'Borrow',
            'donate': 'Free'
        };
        return names[mode] || mode;
    }

    openContactModal(item) {
        document.getElementById('sellerName').textContent = item.sellerName;
        document.getElementById('sellerCollege').textContent = item.sellerCollege;
        document.getElementById('sellerEmail').textContent = item.sellerEmail;
        this.openModal('contactModal');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal?.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    logout() {
        localStorage.removeItem('campuskart_current_user');
        this.showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    initializeSampleData() {
        // Add sample data if no items exist
        if (this.items.length === 0) {
            const sampleItems = [
                {
                    id: 'sample1',
                    name: 'Scientific Calculator TI-84',
                    category: 'tech',
                    mode: 'buy',
                    price: 45.99,
                    description: 'Barely used graphing calculator, perfect for math and engineering courses.',
                    image: null,
                    sellerId: 'sample',
                    sellerName: 'Alex Johnson',
                    sellerCollege: 'State University',
                    sellerEmail: 'alex.j@email.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample2',
                    name: 'Lab Coat - Size M',
                    category: 'lab',
                    mode: 'donate',
                    price: 0,
                    description: 'Clean lab coat, used for one semester. Great condition.',
                    image: null,
                    sellerId: 'sample',
                    sellerName: 'Sarah Chen',
                    sellerCollege: 'Tech Institute',
                    sellerEmail: 'sarah.c@email.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample3',
                    name: 'Organic Chemistry Textbook',
                    category: 'books',
                    mode: 'borrow',
                    price: 0,
                    description: 'Latest edition, available for borrowing for the semester.',
                    image: null,
                    sellerId: 'sample',
                    sellerName: 'Mike Rodriguez',
                    sellerCollege: 'Community College',
                    sellerEmail: 'mike.r@email.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample4',
                    name: 'Notebook Set (5 pack)',
                    category: 'stationery',
                    mode: 'buy',
                    price: 12.50,
                    description: 'Brand new spiral notebooks, perfect for note-taking.',
                    image: null,
                    sellerId: 'sample',
                    sellerName: 'Emma Wilson',
                    sellerCollege: 'Liberal Arts College',
                    sellerEmail: 'emma.w@email.com',
                    createdAt: new Date().toISOString()
                }
            ];

            this.items = sampleItems;
            this.saveItems();
            this.applyFilters();
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CampusKart();
});