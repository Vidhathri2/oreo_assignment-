const API_BASE = '/api';

// State
let state = {
    books: [],
    authors: [],
    categories: [],
    borrowers: [],
    recentTransactions: [],
    currentActionBookId: null,
    currentActionBookTitle: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupFilters();
    fetchInitialData();
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            views.forEach(v => v.classList.remove('active'));
            const viewId = item.getAttribute('data-view');
            const targetView = document.getElementById(`view-${viewId}`);
            if (targetView) {
                targetView.classList.add('active');
                if (viewId === 'dashboard') renderDashboard();
                if (viewId === 'books-list') renderBooksCatalog();
                if (viewId === 'authors-list') renderAuthorsTable();
                if (viewId === 'categories-list') renderCategoriesTable();
                if (viewId === 'borrowers-list') renderBorrowersTable();
            }
        });
    });

    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
    document.getElementById('addAuthorForm').addEventListener('submit', handleAddAuthor);
    document.getElementById('addCategoryForm').addEventListener('submit', handleAddCategory);
    document.getElementById('addBorrowerForm').addEventListener('submit', handleAddBorrower);
}

window.switchView = function (viewId) {
    const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navItem) navItem.click();
}

function setupFilters() {
    document.getElementById('globalSearch').addEventListener('input', debounce((e) => {
        document.getElementById('tableSearch').value = e.target.value;
        applyFilters();
    }, 300));

    document.getElementById('tableSearch').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('filterCategory').addEventListener('change', applyFilters);
    document.getElementById('filterAuthor').addEventListener('change', applyFilters);
    document.getElementById('filterStatus').addEventListener('change', applyFilters);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function fetchInitialData() {
    try {
        const [booksRes, authorsRes, catRes, borRes, txRes] = await Promise.all([
            fetch(`${API_BASE}/books`),
            fetch(`${API_BASE}/metadata/authors`),
            fetch(`${API_BASE}/metadata/categories`),
            fetch(`${API_BASE}/metadata/borrowers`),
            fetch(`${API_BASE}/metadata/transactions`)
        ]);

        if (booksRes.ok) state.books = await booksRes.json();
        if (authorsRes.ok) state.authors = await authorsRes.json();
        if (catRes.ok) state.categories = await catRes.json();
        if (borRes.ok) state.borrowers = await borRes.json();
        if (txRes.ok) state.recentTransactions = await txRes.json();

        populateDropdowns();

        // Render based on active view
        const activeView = document.querySelector('.view.active').id;
        if (activeView === 'view-dashboard') renderDashboard();
        if (activeView === 'view-books-list') renderBooksCatalog();
        if (activeView === 'view-authors-list') renderAuthorsTable();
        if (activeView === 'view-categories-list') renderCategoriesTable();
        if (activeView === 'view-borrowers-list') renderBorrowersTable();

    } catch (err) {
        showToast('Error loading data from server', 'error');
    }
}

function populateDropdowns() {
    const authorSelect = document.getElementById('addBookAuthor');
    const catSelect = document.getElementById('addBookCategory');
    const filterAuthor = document.getElementById('filterAuthor');
    const filterCat = document.getElementById('filterCategory');
    const borrowerSelect = document.getElementById('borrowerSelect');
    const returnBorrowerSelect = document.getElementById('returnBorrowerSelect');

    const authorOpts = state.authors.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    const catOpts = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const borOpts = state.borrowers.map(b => `<option value="${b.id}">${b.name} (${b.email})</option>`).join('');

    if (authorSelect) authorSelect.innerHTML = '<option value="" disabled selected>Select Author</option>' + authorOpts;
    if (filterAuthor) filterAuthor.innerHTML = '<option value="">All Authors</option>' + authorOpts;

    if (catSelect) catSelect.innerHTML = '<option value="" disabled selected>Select Category</option>' + catOpts;
    if (filterCat) filterCat.innerHTML = '<option value="">All Categories</option>' + catOpts;

    const borDefault = '<option value="" disabled selected>Select Borrower</option>';
    if (borrowerSelect) borrowerSelect.innerHTML = borDefault + borOpts;
    if (returnBorrowerSelect) returnBorrowerSelect.innerHTML = borDefault + borOpts;
}

// Rendering Logic
function renderDashboard() {
    updateStatCards();
    renderBooksTable(state.books, 'booksTableBody');
    renderRecentTransactions();
}

function renderBooksCatalog() {
    renderBooksTable(state.books, 'booksCatalogBody');
}

function updateStatCards() {
    const total = state.books.length;
    let available = 0;
    let borrowed = 0;

    state.books.forEach(b => {
        available += b.availableCopies;
        borrowed += (b.totalCopies - b.availableCopies);
    });

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-available').textContent = available;
    document.getElementById('stat-borrowed').textContent = borrowed;
    document.getElementById('stat-borrowers').textContent = state.borrowers.length;
    document.getElementById('stat-categories').textContent = state.categories.length;
}

function renderBooksTable(booksToRender, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';

    if (booksToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">No books found.</td></tr>';
        return;
    }

    booksToRender.forEach(book => {
        const isAvailable = book.availableCopies > 0;
        const statusClass = book.availableCopies === 0 ? 'status-borrowed' : (book.availableCopies < 2 ? 'status-low' : 'status-available');
        const statusText = book.availableCopies === 0 ? 'Borrowed Out' : (book.availableCopies < 2 ? 'Low Stock' : 'Available');

        const coverUrl = book.title.trim().toLowerCase() === '1984'
            ? '/images/1984.jpg'
            : `https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg`;
        const avatarUrl = `https://ui-avatars.com/api/?name=${book.author.name.replace(' ', '+')}&background=random&rounded=true`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="book-detail-cell">
                    <img src="${coverUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${book.title[0]}&background=e2e8f0&color=64748b'" class="book-cover" alt="Cover">
                    <div class="book-info">
                        <h4>${book.title}</h4>
                        <p>ISBN: ${book.isbn}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="author-cell">
                    <img src="${avatarUrl}" class="author-avatar" alt="Author">
                    <span>${book.author.name}</span>
                </div>
            </td>
            <td>
                <span class="badge-outline">${book.category.name}</span>
            </td>
            <td>
                <div style="font-size:12px">
                    Total: <strong>${book.totalCopies}</strong><br>
                    Available: <strong style="color:${isAvailable ? 'var(--success)' : 'var(--danger)'}">${book.availableCopies}</strong>
                </div>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="icon-action issue" onclick="openBorrowModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')" title="Issue Book" ${!isAvailable ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-book-open-reader"></i>
                    </button>
                    <button class="icon-action edit" onclick="openReturnModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')" title="Return Book" ${book.availableCopies === book.totalCopies ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
                    <button class="icon-action delete" onclick="deleteBook(${book.id})" title="Delete Book">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAuthorsTable() {
    const tbody = document.getElementById('authorsTableBody');
    tbody.innerHTML = '';
    state.authors.forEach(author => {
        tbody.innerHTML += `
            <tr>
                <td>${author.id}</td>
                <td>
                    <div class="author-cell">
                        <img src="https://ui-avatars.com/api/?name=${author.name.replace(' ', '+')}&background=random" class="author-avatar" alt="Author">
                        <strong>${author.name}</strong>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-action delete" onclick="deleteMetadata('authors', ${author.id})" title="Delete Author">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '';
    state.categories.forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td>${cat.id}</td>
                <td><span class="badge-outline" style="font-size:14px">${cat.name}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-action delete" onclick="deleteMetadata('categories', ${cat.id})" title="Delete Category">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderBorrowersTable() {
    const tbody = document.getElementById('borrowersTableBody');
    tbody.innerHTML = '';
    state.borrowers.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>${b.id}</td>
                <td>
                    <div class="author-cell">
                        <img src="https://ui-avatars.com/api/?name=${b.name.replace(' ', '+')}&background=random" class="author-avatar" alt="User">
                        <strong>${b.name}</strong>
                    </div>
                </td>
                <td>${b.email}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-action delete" onclick="deleteMetadata('borrowers', ${b.id})" title="Delete Borrower">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderRecentTransactions() {
    const list = document.getElementById('recentBorrowersList');
    if (!list) return;
    list.innerHTML = '';

    if (state.recentTransactions.length === 0) {
        list.innerHTML = '<div class="empty-state">No recent activity</div>';
        return;
    }

    state.recentTransactions.slice(0, 4).forEach(tx => {
        const isReturn = tx.returnDate !== null;
        const type = isReturn ? 'return' : 'borrow';
        const bookTitle = tx.book.title;
        const borrowerName = tx.borrower.name;

        const item = document.createElement('div');
        item.className = 'recent-item';
        item.innerHTML = `
            <div class="recent-user">
                <img src="https://ui-avatars.com/api/?name=${borrowerName.replace(' ', '+')}&background=random" alt="User">
                <div>
                    <h4>${bookTitle}</h4>
                    <p>${isReturn ? 'Returned by' : 'Borrowed by'} ${borrowerName}</p>
                </div>
            </div>
            <div class="recent-action" ${!isReturn ? `style="cursor:pointer;" onclick="quickReturn(${tx.book.id}, ${tx.borrower.id})" title="Quick Return Book"` : ''}>
                <i class="fa-solid ${isReturn ? 'fa-arrow-right-to-bracket' : 'fa-arrow-right-from-bracket'}" style="color: ${isReturn ? 'var(--success)' : 'var(--orange)'}; background: ${isReturn ? 'var(--success-bg)' : 'var(--warning-bg)'}"></i>
            </div>
        `;
        list.appendChild(item);
    });
}

// Window globally accessible functions
window.applyFilters = async function () {
    const query = document.getElementById('tableSearch').value.trim();
    const catId = document.getElementById('filterCategory').value;
    const authorId = document.getElementById('filterAuthor').value;
    const status = document.getElementById('filterStatus').value;

    let filtered = [...state.books];

    if (query.length > 0) {
        try {
            const res = await fetch(`${API_BASE}/books/search?query=${encodeURIComponent(query)}`);
            if (res.ok) filtered = await res.json();
        } catch (e) { }
    }

    if (catId) filtered = filtered.filter(b => b.category.id == catId);
    if (authorId) filtered = filtered.filter(b => b.author.id == authorId);
    if (status === 'available') filtered = filtered.filter(b => b.availableCopies > 0);
    if (status === 'borrowed') filtered = filtered.filter(b => b.availableCopies < b.totalCopies);
    if (status === 'low_stock') filtered = filtered.filter(b => b.availableCopies === 1);
    if (status === 'out_of_stock') filtered = filtered.filter(b => b.availableCopies === 0);

    renderBooksTable(filtered, 'booksTableBody');
}

window.resetFilters = function () {
    document.getElementById('tableSearch').value = '';
    document.getElementById('globalSearch').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterAuthor').value = '';
    document.getElementById('filterStatus').value = '';
    renderBooksTable(state.books, 'booksTableBody');
}

window.scrollToTableAndHighlight = function () {
    const tableContainer = document.querySelector('.dashboard-left');
    if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        tableContainer.classList.add('highlight-pulse');
        setTimeout(() => tableContainer.classList.remove('highlight-pulse'), 1500);
    }
}

window.openModal = function (id) {
    const formMap = {
        'addBookModal': 'addBookForm',
        'addAuthorModal': 'addAuthorForm',
        'addCategoryModal': 'addCategoryForm',
        'addBorrowerModal': 'addBorrowerForm'
    };
    if (formMap[id]) document.getElementById(formMap[id]).reset();
    document.getElementById(id).classList.add('active');
}

window.closeModal = function (id) {
    document.getElementById(id).classList.remove('active');
    state.currentActionBookId = null;
}

// Form Handlers
async function handleAddBook(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const book = {
        title: fd.get('title'),
        isbn: fd.get('isbn'),
        totalCopies: parseInt(fd.get('totalCopies')),
        availableCopies: parseInt(fd.get('availableCopies')),
        author: { id: parseInt(fd.get('authorId')) },
        category: { id: parseInt(fd.get('categoryId')) }
    };
    await submitForm(`${API_BASE}/books`, book, 'addBookModal', 'Book added successfully!');
}

async function handleAddAuthor(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await submitForm(`${API_BASE}/metadata/authors`, { name: fd.get('name') }, 'addAuthorModal', 'Author added successfully!');
}

async function handleAddCategory(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await submitForm(`${API_BASE}/metadata/categories`, { name: fd.get('name') }, 'addCategoryModal', 'Category added successfully!');
}

async function handleAddBorrower(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    await submitForm(`${API_BASE}/metadata/borrowers`, { name: fd.get('name'), email: fd.get('email') }, 'addBorrowerModal', 'Borrower registered successfully!');
}

async function submitForm(url, payload, modalId, successMsg) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            showToast(successMsg, 'success');
            closeModal(modalId);
            fetchInitialData();
        } else {
            const err = await res.json();
            showToast(err.error || 'Operation failed', 'error');
        }
    } catch (err) { showToast('Network error', 'error'); }
}

window.deleteBook = async function (id) {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
        const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Book deleted', 'success');
            fetchInitialData();
        } else {
            showToast('Error deleting book', 'error');
        }
    } catch (e) { }
}

window.openBorrowModal = function (id, title) {
    state.currentActionBookId = id;
    state.currentActionBookTitle = title;

    document.getElementById('borrowBookInfo').innerHTML = `
        <i class="fa-solid fa-book text-purple" style="font-size:24px"></i>
        <div>
            <h4 style="font-size:14px; margin-bottom:4px;">${title}</h4>
            <p style="font-size:12px; color:var(--text-muted)">ID: ${id}</p>
        </div>
    `;
    document.getElementById('borrowerSelect').value = '';
    document.getElementById('borrowModal').classList.add('active');
}

window.openReturnModal = function (id, title) {
    state.currentActionBookId = id;
    state.currentActionBookTitle = title;

    document.getElementById('returnBookInfo').innerHTML = `
        <i class="fa-solid fa-book text-green" style="font-size:24px"></i>
        <div>
            <h4 style="font-size:14px; margin-bottom:4px;">${title}</h4>
            <p style="font-size:12px; color:var(--text-muted)">ID: ${id}</p>
        </div>
    `;
    document.getElementById('returnBorrowerSelect').value = '';
    document.getElementById('returnModal').classList.add('active');
}

window.confirmBorrow = async function () {
    const borId = document.getElementById('borrowerSelect').value;
    if (!borId) return showToast('Select a borrower', 'error');

    try {
        const res = await fetch(`${API_BASE}/books/${state.currentActionBookId}/borrow?borrowerId=${borId}`, { method: 'POST' });
        if (res.ok) {
            showToast('Book issued successfully', 'success');
            closeModal('borrowModal');
            fetchInitialData();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to issue book', 'error');
        }
    } catch (e) { showToast('Error', 'error'); }
}

window.confirmReturn = async function () {
    const borId = document.getElementById('returnBorrowerSelect').value;
    if (!borId) return showToast('Select a borrower', 'error');

    try {
        const res = await fetch(`${API_BASE}/books/${state.currentActionBookId}/return?borrowerId=${borId}`, { method: 'POST' });
        if (res.ok) {
            showToast('Book returned successfully', 'success');
            closeModal('returnModal');
            fetchInitialData();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to return book', 'error');
        }
    } catch (e) { showToast('Error', 'error'); }
}

window.quickReturn = async function (bookId, borrowerId) {
    if (!confirm("Process return for this book?")) return;
    try {
        const res = await fetch(`${API_BASE}/books/${bookId}/return?borrowerId=${borrowerId}`, { method: 'POST' });
        if (res.ok) {
            showToast('Book returned successfully', 'success');
            fetchInitialData();
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to return book', 'error');
        }
    } catch (e) { showToast('Error', 'error'); }
}

window.deleteMetadata = async function (type, id) {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/metadata/${type}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast(`${type.slice(0, -1)} deleted successfully`, 'success');
            fetchInitialData();
        } else {
            const err = await res.json();
            showToast(err.error || `Failed to delete ${type.slice(0, -1)}`, 'error');
        }
    } catch (e) { showToast('Error', 'error'); }
}



function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}
