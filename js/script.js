// Main JavaScript file for LibraryOS

const SUPABASE_URL = "https://upadhfzyeluusknpztbi.supabase.co"

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYWRoZnp5ZWx1dXNrbnB6dGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDg0NDYsImV4cCI6MjA4NzQ4NDQ0Nn0.cJKKpE4tnWZW9wibu9BkwoVSN3O5h2gsIXUpCdhMZ6g"

window.supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all components
    initializeNavigation();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeTestimonials();
});

// Navigation functionality
function initializeNavigation() {
    // Handle active navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    // Update active link on scroll
    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-item, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Testimonials functionality
function initializeTestimonials() {
    // Add any testimonial-specific functionality here
    // For example: auto-rotation of testimonials
}

// Utility functions
const utils = {
    // Format currency
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date
    formatDate: (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generate random ID
    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    // Validate email
    validateEmail: (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
};

// Local storage management
const storage = {
    // Set item with expiration
    set: (key, value, expirationMinutes = null) => {
        const item = {
            value: value,
            timestamp: expirationMinutes ? new Date().getTime() : null,
            expiration: expirationMinutes ? expirationMinutes * 60 * 1000 : null
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    // Get item with expiration check
    get: (key) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        let item;
        try {
            item = JSON.parse(itemStr);
        } catch {
            return itemStr;
        }

        // Check if item has expiration
        if (item.timestamp && item.expiration) {
            const now = new Date().getTime();
            if (now - item.timestamp > item.expiration) {
                localStorage.removeItem(key);
                return null;
            }
        }

        return item.value ?? item;
    },

    // Remove item
    remove: (key) => {
        localStorage.removeItem(key);
    },

    // Clear all library-related items
    clearAll: () => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('library_') ||
                key === 'userEmail' ||
                key === 'userRole' ||
                key === 'userName' ||
                key === 'userPicture' ||
                key === 'userMembership' ||
                key === 'selectedPlan') {
                localStorage.removeItem(key);
            }
        });
    }
};

// API simulation functions
const api = {
    // Simulate API delay
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Simulate book search
    searchBooks: async (query, category = 'all') => {
        await api.delay(500); // Simulate network delay

        // This would be replaced with actual API call
        const books = []; // Your book data would go here
        return books.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.category.toLowerCase().includes(query.toLowerCase())
        );
    },

    // Simulate user authentication
    authenticate: async (email, password) => {
        await api.delay(1000); // Simulate network delay

        // Demo authentication - replace with real API call
        if ((email === 'admin@library.com' && password === 'password') ||
            (email === 'user@library.com' && password === 'password')) {
            return {
                success: true,
                user: {
                    email: email,
                    name: email === 'admin@library.com' ? 'Admin User' : 'Regular User',
                    role: email === 'admin@library.com' ? 'admin' : 'user'
                }
            };
        } else {
            return {
                success: false,
                error: 'Invalid credentials'
            };
        }
    },

    // Simulate payment processing
    processPayment: async (paymentDetails) => {
        await api.delay(2000); // Simulate payment processing

        // Demo payment processing - replace with real payment gateway integration
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo

        if (isSuccess) {
            return {
                success: true,
                transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                message: 'Payment processed successfully'
            };
        } else {
            return {
                success: false,
                error: 'Payment processing failed. Please try again.'
            };
        }
    }
};

// Notification system
const notifications = {
    // Show notification
    show: (message, type = 'info', duration = 5000) => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                }
                .notification-content {
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .notification-message {
                    flex: 1;
                    margin-right: 15px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                }
                .notification-info { border-left: 4px solid #667eea; }
                .notification-success { border-left: 4px solid #10b981; }
                .notification-warning { border-left: 4px solid #f59e0b; }
                .notification-error { border-left: 4px solid #ef4444; }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after duration
        const autoRemove = setTimeout(() => {
            notification.remove();
        }, duration);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            notification.remove();
        });
    },

    // Success notification
    success: (message, duration = 5000) => {
        notifications.show(message, 'success', duration);
    },

    // Error notification
    error: (message, duration = 5000) => {
        notifications.show(message, 'error', duration);
    },

    // Warning notification
    warning: (message, duration = 5000) => {
        notifications.show(message, 'warning', duration);
    },

    // Info notification
    info: (message, duration = 5000) => {
        notifications.show(message, 'info', duration);
    }
};

// Form validation utilities
const formValidator = {
    // Validate required fields
    validateRequired: (value) => {
        return value && value.trim().length > 0;
    },

    // Validate email
    validateEmail: (email) => {
        return utils.validateEmail(email);
    },

    // Validate password strength
    validatePassword: (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
            requirements: {
                length: password.length >= minLength,
                upperCase: hasUpperCase,
                lowerCase: hasLowerCase,
                numbers: hasNumbers,
                specialChar: hasSpecialChar
            }
        };
    },

    // Validate credit card number (Luhn algorithm)
    validateCreditCard: (number) => {
        // Remove spaces and dashes
        const cleaned = number.replace(/[\s-]/g, '');

        // Check if it's all digits and correct length
        if (!/^\d{13,19}$/.test(cleaned)) return false;

        // Luhn algorithm
        let sum = 0;
        let isEven = false;

        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return (sum % 10) === 0;
    },

    // Validate expiry date
    validateExpiryDate: (date) => {
        if (!/^\d{2}\/\d{2}$/.test(date)) return false;

        const [month, year] = date.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (month < 1 || month > 12) return false;
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;

        return true;
    }
};

// Export utilities for global access
window.LibraryOS = {
    utils,
    storage,
    api,
    notifications,
    formValidator
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('LibraryOS initialized successfully');

    // Check if user is logged in and update UI accordingly
    const userEmail = storage.get('userEmail');
    if (userEmail) {
        console.log('User is logged in:', userEmail);
    }

    // Add logout event listener if logout button exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        console.log('Logout button found, adding event listener');
        logoutBtn.addEventListener('click', logout);
    }
});



// Logout function
function logout() {
    console.log("Logout function called");
    // Clear all user data from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    // Redirect to login page
    window.location.href = "login.html";
}

// Global logout function for onclick handlers
window.logout = function () {
    console.log("Logging out...");

    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    window.location.href = "login.html";
};