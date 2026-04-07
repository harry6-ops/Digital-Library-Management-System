// Payment page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get selected plan from localStorage
    const selectedPlan = localStorage.getItem('selectedPlan') || 'basic';
    
    // Initialize payment page
    initializePaymentPage(selectedPlan);
    
    // Set up billing cycle toggle
    setupBillingCycle();
    
    // Set up payment method tabs
    setupPaymentTabs();
    
    // Set up form submission
    setupFormSubmission();
});

function initializePaymentPage(plan) {
    const planPrices = {
        'basic': { monthly: 4.99, yearly: 47.99 },
        'standard': { monthly: 9.99, yearly: 95.99 },
        'premium': { monthly: 14.99, yearly: 143.99 },
        'family': { monthly: 24.99, yearly: 239.99 }
    };
    
    const planNames = {
        'basic': 'Basic Plan',
        'standard': 'Standard Plan',
        'premium': 'Premium Plan',
        'family': 'Family Plan'
    };
    
    const currentPrices = planPrices[plan];
    const planName = planNames[plan];
    
    // Update selected plan display
    document.getElementById('selectedPlan').innerHTML = `
        <h4>${planName}</h4>
        <p>Unlock full access to our library collection</p>
    `;
    
    // Update prices
    document.getElementById('monthlyPrice').textContent = `$${currentPrices.monthly}/month`;
    document.getElementById('yearlyPrice').textContent = `$${currentPrices.yearly}/year`;
    
    // Update payment amount
    updatePaymentAmount(currentPrices.monthly);
    
    // Store current prices for calculations
    document.getElementById('selectedPlan').setAttribute('data-prices', JSON.stringify(currentPrices));
}

function setupBillingCycle() {
    const cycleOptions = document.querySelectorAll('.cycle-option');
    
    cycleOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            cycleOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update payment amount
            const cycle = this.getAttribute('data-cycle');
            const prices = JSON.parse(document.getElementById('selectedPlan').getAttribute('data-prices'));
            
            const amount = cycle === 'monthly' ? prices.monthly : prices.yearly;
            updatePaymentAmount(amount);
        });
    });
}

function updatePaymentAmount(amount) {
    const tax = amount * 0.1; // 10% tax
    const total = amount + tax;
    
    document.getElementById('subtotal').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('payAmount').textContent = total.toFixed(2);
}

function setupPaymentTabs() {
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            // Remove active class from all tabs and methods
            paymentTabs.forEach(t => t.classList.remove('active'));
            paymentMethods.forEach(m => m.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding method
            this.classList.add('active');
            document.getElementById(`${method}Method`).classList.add('active');
        });
    });
}

function setupFormSubmission() {
    const cardForm = document.getElementById('cardPaymentForm');
    
    cardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        // Basic validation
        if (!validateCardNumber(cardNumber)) {
            alert('Please enter a valid card number');
            return;
        }
        
        if (!validateExpiryDate(expiryDate)) {
            alert('Please enter a valid expiry date (MM/YY)');
            return;
        }
        
        if (!validateCVV(cvv)) {
            alert('Please enter a valid CVV');
            return;
        }
        
        // Process payment
        processCardPayment({
            cardNumber,
            expiryDate,
            cvv,
            cardName
        });
    });
}

function validateCardNumber(number) {
    // Simple validation - in real app, use proper validation
    const cleaned = number.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
}

function validateExpiryDate(date) {
    return /^\d{2}\/\d{2}$/.test(date);
}

function validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function processCardPayment(cardDetails) {
    // Show loading state
    const submitBtn = document.querySelector('.pay-now-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // In a real application, this would communicate with a payment gateway
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        if (isSuccess) {
            // Payment successful
            alert('Payment successful! Your membership has been activated.');
            
            // Update user membership
            const selectedPlan = localStorage.getItem('selectedPlan');
            localStorage.setItem('userMembership', selectedPlan);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Payment failed
            alert('Payment failed. Please check your card details and try again.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 2000);
}

function processPayPalPayment() {
    // Simulate PayPal payment
    alert('Redirecting to PayPal...');
    
    // In a real application, this would redirect to PayPal
    setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        if (isSuccess) {
            alert('PayPal payment successful! Your membership has been activated.');
            
            // Update user membership
            const selectedPlan = localStorage.getItem('selectedPlan');
            localStorage.setItem('userMembership', selectedPlan);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('PayPal payment failed. Please try again.');
        }
    }, 1500);
}

function processGooglePayPayment() {
    // Simulate Google Pay payment
    alert('Redirecting to Google Pay...');
    
    // In a real application, this would use the Google Pay API
    setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        
        if (isSuccess) {
            alert('Google Pay payment successful! Your membership has been activated.');
            
            // Update user membership
            const selectedPlan = localStorage.getItem('selectedPlan');
            localStorage.setItem('userMembership', selectedPlan);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Google Pay payment failed. Please try again.');
        }
    }, 1500);
}