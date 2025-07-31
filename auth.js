// Authentication JavaScript
class AuthManager {
    constructor() {
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.getAttribute('data-tab'));
            });
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Mode toggle handling
        document.getElementById('itemMode')?.addEventListener('change', (e) => {
            const priceGroup = document.getElementById('priceGroup');
            if (e.target.value === 'donate') {
                priceGroup.style.display = 'none';
            } else {
                priceGroup.style.display = 'block';
            }
        });
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if user exists
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.setCurrentUser(user);
            this.showNotification('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const college = document.getElementById('signupCollege').value.trim();
        const role = document.querySelector('input[name="role"]:checked').value;

        // Validation
        if (!name || name.length < 2) {
            this.showNotification('Please enter a valid name', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (!college || college.length < 2) {
            this.showNotification('Please enter your college name', 'error');
            return;
        }

        // Check if user already exists
        const users = this.getUsers();
        if (users.some(u => u.email === email)) {
            this.showNotification('User with this email already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            college,
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('campuskart_users', JSON.stringify(users));
        
        this.setCurrentUser(newUser);
        this.showNotification('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('campuskart_users') || '[]');
    }

    setCurrentUser(user) {
        localStorage.setItem('campuskart_current_user', JSON.stringify(user));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('campuskart_current_user') || 'null');
    }

    checkAuthStatus() {
        const currentUser = this.getCurrentUser();
        if (currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'home.html';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});