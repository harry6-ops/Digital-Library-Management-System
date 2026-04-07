// Book data state
let books = [];

// Initialize books page
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication - Optional for now or basic check
    const userEmail = localStorage.getItem('userEmail');

    // Load books from backend
    fetchBooks();

    // Set up category filters
    setupCategoryFilters();

    // Set up search functionality
    setupSearch();

    // Set up modal
    setupModal();
});

async function fetchBooks() {
    try {
        const data = await apiService.getBooks();

        let bookList = [];
        if (Array.isArray(data)) {
            bookList = data;
        } else if (data && data.books) {
            bookList = data.books;
        }

        const STORAGE_BASE = "https://upadhfzyeluusknpztbi.supabase.co/storage/v1/object/public";

        if (bookList.length > 0) {
            books = bookList.map(book => {
                let coverUrl = book.cover_image || book.cover || '';
                if (book.cover_path) coverUrl = `${STORAGE_BASE}/covers/${book.cover_path}`;

                let pdfUrl = book.book_file || book.file_url || '';
                if (book.pdf_path) pdfUrl = `${STORAGE_BASE}/books/${book.pdf_path}`;

                return {
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    category: book.category || 'Fiction',
                    description: book.description || '',
                    status: book.available_copies > 0 ? 'available' : 'borrowed',
                    icon: '📚',
                    coverUrl: coverUrl,
                    pdfUrl: pdfUrl,
                    year: book.publication_year || (book.created_at ? new Date(book.created_at).getFullYear() : new Date().getFullYear())
                };
            });
            renderBooks('all');
        } else {
            renderBooks('all');
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        const booksGrid = document.getElementById('booksGrid');
        if (booksGrid) {
            booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading books. Please try again later.</p>';
        }
    }
}

function renderBooks(category) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '';

    const filteredBooks = category === 'all'
        ? books
        : books.filter(book => book.category.toLowerCase() === category.toLowerCase());

    // Show newest first
    filteredBooks.reverse();

    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No books found.</p>';
        return;
    }

    filteredBooks.forEach((book, index) => {
        const bookCard = createBookCard(book, index);
        booksGrid.appendChild(bookCard);
    });
}

function createBookCard(book, index) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    const gradients = [
        'linear-gradient(135deg, #2c5f7f 0%, #1a3a4d 100%)',
        'linear-gradient(135deg, #4a90e2 0%, #2563a8 100%)',
        'linear-gradient(135deg, #a8c5a0 0%, #7a9972 100%)',
        'linear-gradient(135deg, #d4a574 0%, #a67c52 100%)',
        'linear-gradient(135deg, #c94b4b 0%, #8b3535 100%)'
    ];
    // Use index (not book.id) so gradient works for both UUID and int IDs
    const randomGradient = gradients[(index || 0) % gradients.length];

    const year = book.year || new Date().getFullYear();

    // Always quote the ID so onclick works whether ID is int or UUID string
    const safeId = String(book.id).replace(/'/g, "\\'");

    let downloadAction = `alert('Downloading...')`;
    if (book.pdfUrl) downloadAction = `window.open('${book.pdfUrl}', '_blank')`;

    bookCard.innerHTML = `
        <div class="book-cover" style="background: ${randomGradient};">
            <img src="${book.coverUrl}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>
        <div class="book-info">
            <div class="book-category">${getCategoryName(book.category)}</div>
            <div class="book-title">${book.title}</div>
            <div class="book-author">by ${book.author}</div>
             <div class="book-rating-row">
                <span class="stars">⭐ 4.5 <span style="color:#9ca3af; font-weight:400;">(120)</span></span>
                <span class="book-year">${year}</span>
            </div>
            
            <div class="book-actions-row">
                <button class="btn-read" onclick="event.stopPropagation(); readBook('${safeId}')">
                    <i class="fas fa-book-open"></i> Read
                </button>
                <button class="btn-download" onclick="event.stopPropagation(); ${downloadAction}">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `;

    return bookCard;
}

// Pagination State
let currentBookId = null;
let currentPage = 1;
const totalPages = 5;

function readBook(bookId) {
    // Support both numeric and UUID string IDs (compare as strings)
    const book = books.find(b => String(b.id) === String(bookId));
    if (!book) {
        console.warn('readBook: book not found for id', bookId);
        return;
    }

    currentBookId = bookId;
    currentPage = 1;

    const readerView = document.getElementById('readerView');
    const readerTitle = document.getElementById('readerTitle');

    if (readerView && readerTitle) {
        readerTitle.textContent = book.title;

        const readerContent = document.querySelector('.reader-content');
        const paginationArea = document.getElementById('readerPagination');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const downloadBtn = document.getElementById('readerDownloadBtn');

        if (book.pdfUrl) {
            // Show PDF inside iframe, hide pagination
            if (readerContent) {
                readerContent.innerHTML = `
                    <iframe
                        src="${book.pdfUrl}"
                        id="pdfFrame"
                        style="width:100%; height:100%; border:none; display:block; flex:1;"
                        allowfullscreen
                        title="${book.title}"
                    ></iframe>`;
            }
            // Hide pagination controls for PDF mode
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (paginationArea) paginationArea.style.display = 'none';
            // Wire download button to PDF
            if (downloadBtn) {
                downloadBtn.style.display = '';
                downloadBtn.onclick = () => window.open(book.pdfUrl, '_blank');
            }
        } else {
            // Text reader fallback
            if (readerContent) {
                readerContent.innerHTML = '<div class="reader-page-wrapper"><div class="reader-page" id="readerPageContent"></div></div>';
            }
            renderReaderPage();
            // Show pagination controls
            if (prevBtn) { prevBtn.style.display = ''; prevBtn.onclick = () => changePage(-1); }
            if (nextBtn) { nextBtn.style.display = ''; nextBtn.onclick = () => changePage(1); }
            if (paginationArea) paginationArea.style.display = '';
            // Hide download for text books
            if (downloadBtn) downloadBtn.style.display = 'none';
        }

        readerView.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderReaderPage();
        const wrapper = document.querySelector('.reader-page-wrapper');
        if (wrapper) wrapper.scrollTop = 0;
    }
}

function renderReaderPage() {
    const book = books.find(b => b.id === currentBookId);
    if (!book) return;

    const readerPageContent = document.getElementById('readerPageContent');
    if (!readerPageContent) return;

    let content = `<h1>${book.title}</h1><h2>by ${book.author}</h2>`;

    if (currentPage === 1) {
        content += getDummyText(book.title, 1);
    } else {
        content += getDummyText(book.title, currentPage);
    }

    content += `<div class="reader-footer">Page ${currentPage} of ${totalPages}</div>`;
    readerPageContent.innerHTML = content;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
        nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
    }
}

function closeReader() {
    const readerView = document.getElementById('readerView');
    if (readerView) {
        readerView.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function getDummyText(title, page) {
    const chapters = [
        "The Beginning", "The Journey", "The Conflict", "The Resolution", "The End"
    ];
    // Default to page 1 if not provided or out of bounds
    const pageIndex = (page && page > 0) ? page - 1 : 0;
    const chapterName = chapters[pageIndex % chapters.length];

    return `
        <p><strong>Chapter ${page || 1}: ${chapterName}</strong></p>
        <p>Here is page ${page || 1} of the book "<em>${title}</em>".</p>
        <p>It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.</p>
        <p>The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features. Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week.</p>
        <p>The flat was seven flights up, and Winston, who was thirty-nine and had a varicose ulcer above his right ankle, went slowly, resting several times on the way. On each landing, opposite the lift-shaft, the poster with the enormous face gazed from the wall. It was one of those pictures which are so contrived that the eyes follow you about when you move. BIG BROTHER IS WATCHING YOU, the caption beneath it ran.</p>
        <p>Inside the flat a fruity voice was reading out a list of figures which had something to do with the production of pig-iron. The voice came from an oblong metal plaque like a dulled mirror which formed part of the surface of the right-hand wall. Winston turned a switch and the voice sank somewhat, though the words were still distinguishable. The instrument (the telescreen, it was called) could be dimmed, but there was no way of shutting it off completely.</p>
        <p>He moved over to the window: a smallish, frail figure, the meagreness of his body merely emphasized by the blue overalls which were the uniform of the Party. His hair was very fair, his face naturally sanguine, his skin roughened by coarse soap and blunt razor blades and the cold of the winter that had just ended.</p>
        <p>Outside, even through the shut window-pane, the world looked cold. Down in the street little eddies of wind were whirling dust and torn paper into spirals, and though the sun was shining and the sky a harsh blue, there seemed to be no colour in anything, except the posters that were plastered everywhere. The blackmoustachio'd face gazed down from every commanding corner. There was one on the house-front immediately opposite. BIG BROTHER IS WATCHING YOU, the caption said, while the dark eyes looked deep into Winston's own.</p>
    `;
}

function getCategoryName(category) {
    const categoryMap = {
        'fiction': 'Fiction',
        'scifi': 'Science Fiction',
        'mystery': 'Mystery & Thriller',
        'romance': 'Romance',
        'cbse': 'CBSE',
        'icse': 'ICSE/ISC',
        'competitive': 'Competitive Exams',
        'mythology': 'Mythology',
        'biography': 'Biography'
    };

    return categoryMap[category] || category;
}

function setupCategoryFilters() {
    const categoryTags = document.querySelectorAll('.category-tag');

    categoryTags.forEach(tag => {
        tag.addEventListener('click', function () {
            // Remove active class from all tags
            categoryTags.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tag
            this.classList.add('active');

            // Render books for selected category
            const category = this.getAttribute('data-category');
            renderBooks(category);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('bookSearch');
    // const searchButton = document.querySelector('.search-box button'); // Removed if no button

    if (!searchInput) return;

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();

        if (searchTerm.trim() === '') {
            // Re-render all or currently active category
            // For simplicity, let's just render all for now or check active tag
            // const activeCategory = document.querySelector('.category-tag.active')?.getAttribute('data-category') || 'all';
            renderBooks('all');
            return;
        }

        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );

        const booksGrid = document.getElementById('booksGrid');
        if (!booksGrid) return;

        booksGrid.innerHTML = '';

        if (filteredBooks.length === 0) {
            booksGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #666;">No books found matching your search.</div>';
            return;
        }

        filteredBooks.forEach((book, index) => {
            const bookCard = createBookCard(book, index);
            booksGrid.appendChild(bookCard);
        });
    };

    searchInput.addEventListener('input', performSearch);
    // searchButton?.addEventListener('click', performSearch);
}

function setupModal() {
    const modal = document.getElementById('bookModal');
    // If modal doesn't exist in dashboard.html yet, we might need to add it or skip
    if (!modal) return;

    // ... existing modal logic if we had the modal HTML ...
    // Since we removed the modal HTML from the logic above (or rather, I am replacing the file content), 
    // I should probably simplify this or check if modal exists.
    // The previous dashboard.html didn't seem to have a modal structure in the snippet I saw.
    // I'll keep the function but make it safe.

    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function openBookModal(book) {
    // For now, let's just log or alert, or maybe we don't need a modal if we have "Read Now"
    // But if we want a modal, we need to inject the HTML for it into dashboard.html first.
    // Given the request was "search and read", the modal might be secondary. 
    // I will implement a simple alert or console log for now if modal is missing.
    console.log('Opening details for', book.title);
}