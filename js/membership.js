// Initialize membership page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set current membership details
    setMembershipDetails();
});

function setMembershipDetails() {
    // In a real application, this would fetch from an API
    const userRole = localStorage.getItem('userRole');
    const currentPlan = userRole === 'admin' ? 'premium' : 'basic';
    
    // Update UI based on current plan
    const membershipBadge = document.querySelector('.membership-badge');
    const currentPlanCard = document.querySelector('.current-membership .membership-card');
    
    if (currentPlan === 'premium') {
        membershipBadge.textContent = 'Premium Member';
        membershipBadge.className = 'membership-badge premium';
        currentPlanCard.classList.add('premium');
    } else {
        membershipBadge.textContent = 'Basic Member';
        membershipBadge.className = 'membership-badge basic';
    }
}

function selectPlan(plan) {
    // Store selected plan
    localStorage.setItem('selectedPlan', plan);
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}