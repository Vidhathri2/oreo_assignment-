const API_BASE = '/api';

// State
let booksData = [];
let authorsData = [];
let categoriesData = [];
let borrowersData = [];
let currentBookActionId = null;

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    fetchMetadata();
    fetchBooks();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
        });
    });

    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
    
    // Search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if(query.length > 0) {
                searchBooks(query);
            } else {
                fetchBooks();
            }
        }, 300);
    });

    document.getElementById('confirmBorrowBtn').addEventListener('click', confirmBorrow);
    document.getElementById('confirmReturnBtn').addEventListener('click', confirmReturn);
}

function switchView(viewId) {
    // Update Nav
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[data-view="${viewId}"]`)?.classList.add('active');

    // Update View
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    
    if(viewId === 'dashboard' || viewId === 'books-list') {
        fetchBooks();
    }
}

// API Calls
async function fetchMetadata() {
    try {
        const [authorsRes, categoriesRes, borrowersRes] = await Promise.all([
            fetch(`${API_BASE}/metadata/authors`),
            fetch(`${API_BASE}/metadata/categories`),
            fetch(`${API_BASE}/metadata/borrowers`)
        ]);

        if(authorsRes.ok) authorsData = await authorsRes.json();
        if(categoriesRes.ok) categoriesData = await categoriesRes.json();
        if(borrowersRes.ok) borrowersData = await borrowersRes.json();

        populateDropdowns();
    } catch (error) {
        showToast('Error loading metadata', 'error');
    }
}

async function fetchBooks() {
    try {
        const res = await fetch(`${API_BASE}/books`);
        if (res.ok) {
            booksData = await res.json();
            renderDashboard();
            renderBooksList();
        }
    } catch (error) {
        showToast('Error loading books', 'error');
    }
}

async function searchBooks(query) {
    try {
        const res = await fetch(`${API_BASE}/books/search?query=${encodeURIComponent(query)}`);
        if (res.ok) {
            booksData = await res.json();
            const currentView = document.querySelector('.view.active').id;
            if(currentView === 'view-dashboard') renderDashboard();
            if(currentView === 'view-books-list') renderBooksList();
        }
    } catch (error) {
        showToast('Error searching books', 'error');
    }
}

async function handleAddBook(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookData = {
        title: formData.get('title'),
        isbn: formData.get('isbn'),
        totalCopies: parseInt(formData.get('totalCopies')),
        availableCopies: parseInt(formData.get('availableCopies')),
        author: { id: parseInt(formData.get('authorId')) },
        category: { id: parseInt(formData.get('categoryId')) }
    };

    try {
        const res = await fetch(`${API_BASE}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });

        if (res.ok) {
            showToast('Book added successfully!', 'success');
            e.target.reset();
            switchView('books-list');
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to add book', 'error');
        }
    } catch (error) {
        showToast('Network error while adding book', 'error');
    }
}

async function deleteBook(id) {
    if(!confirm("Are you sure you want to delete this book?")) return;
    
    try {
        const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Book deleted successfully', 'success');
            fetchBooks();
        } else {
            showToast('Failed to delete book', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
}

// UI Rendering
function populateDropdowns() {
    const authorSelect = document.getElementById('authorId');
    const categorySelect = document.getElementById('categoryId');
    const borrowerSelect = document.getElementById('borrowerSelect');
    const returnBorrowerSelect = document.getElementById('returnBorrowerSelect');

    authorSelect.innerHTML = '<option value="" disabled selected>Select Author</option>' + 
        authorsData.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        
    categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>' + 
        categoriesData.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
    const borrowerOptions = '<option value="" disabled selected>Select Borrower</option>' + 
        borrowersData.map(b => `<option value="${b.id}">${b.name} (${b.email})</option>`).join('');
        
    borrowerSelect.innerHTML = borrowerOptions;
    returnBorrowerSelect.innerHTML = borrowerOptions;
}

function renderDashboard() {
    document.getElementById('stat-total-books').textContent = booksData.length;
    
    const borrowed = booksData.reduce((acc, book) => acc + (book.totalCopies - book.availableCopies), 0);
    document.getElementById('stat-borrowed').textContent = borrowed;
    document.getElementById('stat-readers').textContent = borrowersData.length; // Simplified
    
    const recentGrid = document.getElementById('recentBooksGrid');
    recentGrid.innerHTML = '';
    
    // Show last 4 books
    const recentBooks = [...booksData].reverse().slice(0, 4);
    
    recentBooks.forEach(book => {
        const isAvailable = book.availableCopies > 0;
        const card = document.createElement('div');
        card.className = 'book-card glass-panel';
        card.innerHTML = `
            <div class="book-tag">${book.category.name}</div>
            <div class="book-title">${book.title}</div>
            <div class="book-author">By ${book.author.name}</div>
            <div class="book-meta">
                <span class="status ${isAvailable ? 'available' : 'unavailable'}">
                    ${isAvailable ? `${book.availableCopies} Available` : 'Out of Stock'}
                </span>
                <span>ISBN: ${book.isbn.substring(0, 8)}...</span>
            </div>
        `;
        recentGrid.appendChild(card);
    });
}

function renderBooksList() {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';
    
    booksData.forEach(book => {
        const isAvailable = book.availableCopies > 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${book.title}</strong><br>
                <small style="color:var(--text-secondary)">ISBN: ${book.isbn}</small>
            </td>
            <td>${book.author.name}</td>
            <td>
                <span class="book-tag">${book.category.name}</span>
            </td>
            <td>
                <span class="status ${isAvailable ? 'available' : 'unavailable'}">
                    ${book.availableCopies} / ${book.totalCopies}
                </span>
            </td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="openBorrowModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')" ${!isAvailable ? 'disabled style="opacity:0.5"' : ''}>
                        Borrow
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openReturnModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')">
                        Return
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--danger)" onclick="deleteBook(${book.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal Logic
function openBorrowModal(bookId, bookTitle) {
    currentBookActionId = bookId;
    document.getElementById('borrowBookTitle').textContent = `Borrowing: ${bookTitle}`;
    document.getElementById('borrowerSelect').value = '';
    document.getElementById('borrowModal').classList.add('active');
}

function openReturnModal(bookId, bookTitle) {
    currentBookActionId = bookId;
    document.getElementById('returnBookTitle').textContent = `Returning: ${bookTitle}`;
    document.getElementById('returnBorrowerSelect').value = '';
    document.getElementById('returnModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    currentBookActionId = null;
}

async function confirmBorrow() {
    const borrowerId = document.getElementById('borrowerSelect').value;
    if(!borrowerId) {
        showToast('Please select a borrower', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/books/${currentBookActionId}/borrow?borrowerId=${borrowerId}`, { method: 'POST' });
        if(res.ok) {
            showToast('Book borrowed successfully', 'success');
            closeModal('borrowModal');
            fetchBooks();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to borrow book', 'error');
        }
    } catch(e) {
        showToast('Network error', 'error');
    }
}

async function confirmReturn() {
    const borrowerId = document.getElementById('returnBorrowerSelect').value;
    if(!borrowerId) {
        showToast('Please select a borrower', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE}/books/${currentBookActionId}/return?borrowerId=${borrowerId}`, { method: 'POST' });
        if(res.ok) {
            showToast('Book returned successfully', 'success');
            closeModal('returnModal');
            fetchBooks();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to return book', 'error');
        }
    } catch(e) {
        showToast('Network error', 'error');
    }
}

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if(type === 'success') icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3500);
}
