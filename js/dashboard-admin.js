/**
 * Admin Dashboard Logic
 * Handles admin stats, charts, and management widgets.
 */

document.addEventListener('DOMContentLoaded', async function () {
    await loadAdminDashboardData();
    setupAdminSearch();
});

let allRequests = [];

async function loadAdminDashboardData() {
    try {
        const data = await apiService.getDashboardStats();

        // Update Stats
        updateStat('totalBooks', data.stats.totalBooks);
        updateStat('activeUsers', data.stats.activeUsers);
        updateStat('pendingRequests', data.stats.pendingRequests);
        updateStat('totalFines', '$' + (data.stats.totalFines || 0).toFixed(2));

        // Update Recent Requests
        if (data.recentRequests) {
            allRequests = data.recentRequests;
            updateRecentRequests(data.recentRequests);
        }

        // Initialize Charts
        initializeCharts(data);

    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

function updateStat(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateRecentRequests(requests) {
    const list = document.getElementById('recentRequestsList');
    if (!list) return;

    if (requests.length === 0) {
        list.innerHTML = '<div class="request-item">No recent requests</div>';
        return;
    }

    list.innerHTML = requests.map(req => `
        <div class="request-item" id="req-${req.id}">
            <div class="request-header">
                <div>
                    <div class="request-title">${req.title}</div>
                    <div class="request-user">${req.user_name} • ${req.date || 'Today'}</div>
                </div>
                <div class="request-actions">
                    <button class="btn-approve" onclick="handleRequest('${req.id}', 'approve')"><i class="fas fa-check"></i></button>
                    <button class="btn-reject" onclick="handleRequest('${req.id}', 'reject')"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="request-message">Requested by ${req.user_name}</div>
        </div>
    `).join('');
}

function initializeCharts(data) {
    const ctx = document.getElementById('statsChart');
    if (!ctx) return;

    // Use Chart.js if available
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Borrowings',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: '#4a90e2',
                    tension: 0.4
                }, {
                    label: 'Returns',
                    data: [28, 48, 40, 19, 86, 27],
                    borderColor: '#5cb85c',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Global handler for inline onClick
window.handleRequest = async function (id, action) {
    console.log(`Request ${id} ${action}ed`);

    // Visual feedback - remove item
    const item = document.getElementById(`req-${id}`);
    if (item) {
        item.style.transition = 'opacity 0.3s, transform 0.3s';
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';

        setTimeout(() => {
            item.remove();

            // Update stats logic could go here (e.g. decrement pending count)
            const remaining = document.querySelectorAll('.request-item').length;
            if (remaining === 0) {
                const list = document.getElementById('recentRequestsList');
                if (list) list.innerHTML = '<div class="request-item">No recent requests</div>';
            }
        }, 300);
    }

    // In a real app, calls API: await apiService.updateRequestStatus(id, action);
};

function setupAdminSearch() {
    const searchInput = document.getElementById('adminSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allRequests.filter(req =>
            req.title.toLowerCase().includes(query) ||
            req.user_name.toLowerCase().includes(query)
        );
        updateRecentRequests(filtered);
    });
}