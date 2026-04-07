/**
 * User Dashboard Logic
 * Handles user-specific stats, book lists, and interactions.
 */

document.addEventListener('DOMContentLoaded', async function () {
    await loadUserDashboardData();
    setupTabNavigation();
});

async function loadUserDashboardData() {
    try {
        // Fetch dashboard data
        const data = await apiService.getDashboardStats();

        // Update Stats
        updateStat('booksRead', data.stats.booksRead, '12');
        updateStat('pagesRead', data.stats.pagesRead, '3,450');
        updateStat('reviews', data.stats.reviews, '5');

        // Update Collections/Lists
        if (data.recentBooks) {
            updateBookCarousel(data.recentBooks);
        }

    } catch (error) {
        console.error('Error loading user dashboard:', error);
    }
}

function updateStat(id, value, fallback) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || fallback;
    }
}

function updateBookCarousel(books) {
    const carousel = document.querySelector('.books-carousel');
    if (!carousel) return;

    carousel.innerHTML = books.map(book => `
        <div class="book-card" onclick="window.location.href='books.php?id=${book.id}'">
            <div class="book-cover" style="background-image: url('${book.cover}');"></div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-rating">
                    <span class="stars">${getStarRating(book.rating)}</span>
                    <span class="rating-value">${book.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    return starsHtml;
}

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add to clicked tab
            tab.classList.add('active');

            // Hide all content
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            // Show target content
            const targetId = tab.dataset.target;
            document.getElementById(targetId).style.display = 'block';
        });
    });
}