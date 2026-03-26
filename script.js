    `// ============================================================
// NexLib — Library Management System
// Full CRUD with localStorage | Roll No: 24051233
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ==================== SEED DATA ====================
    const SEED_BOOKS = [
        { Book_ID: 1, Title: 'Database System Concepts', Author: 'Silberschatz', Publisher: 'McGraw Hill', Year_of_Publication: 2019, Available_Copies: 5 },
        { Book_ID: 2, Title: 'Introduction to Algorithms', Author: 'Cormen', Publisher: 'MIT Press', Year_of_Publication: 2009, Available_Copies: 3 }
    ];

    const SEED_MEMBERS = [
        { Member_ID: 1, Name: 'Prateek', Email: 'prateek@example.com', Phone_Number: '9876543210', Membership_Date: '2023-01-15' },
        { Member_ID: 2, Name: 'Rahul', Email: 'rahul@example.com', Phone_Number: '9988776655', Membership_Date: '2024-02-10' }
    ];

    const SEED_LIBRARIANS = [
        { Librarian_ID: 1, Name: 'Mr. Sharma', Contact_Details: 'sharma@library.com' }
    ];

    const SEED_ISSUES = [
        { Issue_ID: 1, Book_ID: 1, Member_ID: 1, Librarian_ID: 1, Issue_Date: '2024-03-01', Due_Date: '2024-03-15', Return_Date: null },
        { Issue_ID: 2, Book_ID: 2, Member_ID: 2, Librarian_ID: 1, Issue_Date: '2023-11-01', Due_Date: '2023-11-15', Return_Date: '2023-11-16' }
    ];

    // ==================== LOCAL STORAGE HELPERS ====================
    function getData(key, seed) {
        const stored = localStorage.getItem('nexlib_' + key);
        if (stored) return JSON.parse(stored);
        localStorage.setItem('nexlib_' + key, JSON.stringify(seed));
        return seed;
    }

    function setData(key, data) {
        localStorage.setItem('nexlib_' + key, JSON.stringify(data));
    }

    let books = getData('books', SEED_BOOKS);
    let members = getData('members', SEED_MEMBERS);
    let librarians = getData('librarians', SEED_LIBRARIANS);
    let issues = getData('issues', SEED_ISSUES);

    // ==================== TOAST NOTIFICATIONS ====================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const icons = { success: 'bx-check-circle', error: 'bx-error', info: 'bx-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class='bx ${icons[type]}'></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }

    // ==================== NAVIGATION ====================
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    function navigateTo(target) {
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));

        const targetNav = document.querySelector(`.nav-item[data-target="${target}"]`);
        const targetSection = document.getElementById('section-' + target);

        if (targetNav) targetNav.classList.add('active');
        if (targetSection) {
            targetSection.classList.add('active');
            // Re-trigger animation
            targetSection.style.animation = 'none';
            targetSection.offsetHeight; // reflow
            targetSection.style.animation = '';
        }

        // Refresh data for the section
        if (target === 'dashboard') renderDashboard();
        if (target === 'books') renderBooksTable();
        if (target === 'members') renderMembersTable();
        if (target === 'issues') renderIssuesTable();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.target);
        });
    });

    // "View All Books" button on dashboard
    document.getElementById('viewAllBooksBtn').addEventListener('click', () => navigateTo('books'));

    // ==================== MODAL HELPERS ====================
    function openModal(id) {
        document.getElementById(id).classList.add('active');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    function setupModal(modalId, closeId, overlayId) {
        document.getElementById(closeId).addEventListener('click', () => closeModal(modalId));
        document.getElementById(modalId).addEventListener('click', (e) => {
            if (e.target.id === modalId) closeModal(modalId);
        });
    }

    setupModal('addBookModal', 'closeBookModal', 'addBookModal');
    setupModal('addMemberModal', 'closeMemberModal', 'addMemberModal');
    setupModal('issueBookModal', 'closeIssueModal', 'issueBookModal');

    // Add Book button (header + books section)
    document.getElementById('addBookBtn').addEventListener('click', () => {
        resetBookForm();
        openModal('addBookModal');
    });
    document.getElementById('addBookBtn2').addEventListener('click', () => {
        resetBookForm();
        openModal('addBookModal');
    });

    // Add Member button
    document.getElementById('addMemberBtn').addEventListener('click', () => {
        resetMemberForm();
        openModal('addMemberModal');
    });

    // Issue Book button
    document.getElementById('issueBookBtn').addEventListener('click', () => {
        resetIssueForm();
        populateIssueSelects();
        openModal('issueBookModal');
    });

    // ==================== DASHBOARD ====================
    function renderDashboard() {
        const totalBooks = books.reduce((sum, b) => sum + b.Available_Copies, 0);
        const activeMembers = members.length;
        const issuedBooks = issues.filter(i => i.Return_Date === null).length;
        const today = new Date().toISOString().split('T')[0];
        const overdueReturns = issues.filter(i => i.Return_Date === null && i.Due_Date < today).length;

        animateStat(document.querySelector('#stat-totalBooks .stat-number'), totalBooks);
        animateStat(document.querySelector('#stat-activeMembers .stat-number'), activeMembers);
        animateStat(document.querySelector('#stat-issuedBooks .stat-number'), issuedBooks);
        animateStat(document.querySelector('#stat-overdueReturns .stat-number'), overdueReturns);

        // Update notification badge
        document.getElementById('notifBadge').textContent = overdueReturns;

        // Recent books (last 5)
        const recentBooks = [...books].reverse().slice(0, 5);
        const tbody = document.querySelector('#recentBooksTable tbody');
        tbody.innerHTML = '';

        if (recentBooks.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No books yet. Add some!</td></tr>';
            return;
        }

        recentBooks.forEach(book => {
            const isIssued = issues.some(i => i.Book_ID === book.Book_ID && i.Return_Date === null);
            const statusClass = book.Available_Copies > 0 ? 'available' : 'issued';
            const statusText = book.Available_Copies > 0 ? 'Available' : 'Out of Stock';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${book.Book_ID}</td>
                <td>
                    <span class="fw-bold">${escapeHtml(book.Title)}</span><br>
                    <small class="text-muted">${book.Year_of_Publication} &bull; ${book.Available_Copies} Copies</small>
                </td>
                <td>${escapeHtml(book.Author)}</td>
                <td>${escapeHtml(book.Publisher)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function animateStat(el, target) {
        let current = 0;
        if (target === 0) { el.textContent = '0'; return; }
        const increment = Math.max(1, target / 25);
        const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = Math.floor(current).toLocaleString();
        }, 30);
    }

    // ==================== BOOKS CRUD ====================
    function renderBooksTable(filter = '') {
        const tbody = document.querySelector('#allBooksTable tbody');
        tbody.innerHTML = '';

        const filtered = books.filter(b =>
            b.Title.toLowerCase().includes(filter.toLowerCase()) ||
            b.Author.toLowerCase().includes(filter.toLowerCase()) ||
            b.Publisher.toLowerCase().includes(filter.toLowerCase()) ||
            String(b.Book_ID).includes(filter)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No books found.</td></tr>';
            return;
        }

        filtered.forEach(book => {
            const statusClass = book.Available_Copies > 0 ? 'available' : 'issued';
            const statusText = book.Available_Copies > 0 ? 'Available' : 'Out of Stock';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${book.Book_ID}</td>
                <td>
                    <span class="fw-bold">${escapeHtml(book.Title)}</span><br>
                    <small class="text-muted">${book.Year_of_Publication} &bull; ${book.Available_Copies} Copies</small>
                </td>
                <td>${escapeHtml(book.Author)}</td>
                <td>${escapeHtml(book.Publisher)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn edit-book-btn" data-id="${book.Book_ID}" title="Edit"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn delete delete-book-btn" data-id="${book.Book_ID}" title="Delete"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach edit/delete listeners
        tbody.querySelectorAll('.edit-book-btn').forEach(btn => {
            btn.addEventListener('click', () => editBook(parseInt(btn.dataset.id)));
        });
        tbody.querySelectorAll('.delete-book-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteBook(parseInt(btn.dataset.id)));
        });
    }

    // Book Search
    document.getElementById('bookSearchInput').addEventListener('input', (e) => {
        renderBooksTable(e.target.value);
    });

    // Book Form
    const bookForm = document.getElementById('bookForm');
    let isEditingBook = false;

    function resetBookForm() {
        bookForm.reset();
        document.getElementById('editBookId').value = '';
        document.getElementById('bookModalTitle').textContent = 'Add New Book';
        document.getElementById('bookIdInput').disabled = false;
        document.getElementById('bookFormMessage').textContent = '';
        document.getElementById('bookFormMessage').className = 'form-message';
        isEditingBook = false;
    }

    function editBook(id) {
        const book = books.find(b => b.Book_ID === id);
        if (!book) return;

        isEditingBook = true;
        document.getElementById('bookModalTitle').textContent = 'Edit Book';
        document.getElementById('editBookId').value = id;
        document.getElementById('bookIdInput').value = book.Book_ID;
        document.getElementById('bookIdInput').disabled = true;
        document.getElementById('bookTitle').value = book.Title;
        document.getElementById('bookAuthor').value = book.Author;
        document.getElementById('bookPublisher').value = book.Publisher;
        document.getElementById('bookYear').value = book.Year_of_Publication;
        document.getElementById('bookCopies').value = book.Available_Copies;
        document.getElementById('bookFormMessage').textContent = '';

        openModal('addBookModal');
    }

    function deleteBook(id) {
        const book = books.find(b => b.Book_ID === id);
        if (!book) return;

        // Check if book is currently issued
        const isIssued = issues.some(i => i.Book_ID === id && i.Return_Date === null);
        if (isIssued) {
            showToast('Cannot delete — book is currently issued!', 'error');
            return;
        }

        if (confirm(`Delete "${book.Title}"?`)) {
            books = books.filter(b => b.Book_ID !== id);
            // Also remove any related issues
            issues = issues.filter(i => i.Book_ID !== id);
            setData('books', books);
            setData('issues', issues);
            renderBooksTable();
            showToast('Book deleted successfully!', 'success');
        }
    }

    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('bookFormMessage');

        const bookId = parseInt(document.getElementById('bookIdInput').value);
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const publisher = document.getElementById('bookPublisher').value.trim();
        const year = parseInt(document.getElementById('bookYear').value);
        const copies = parseInt(document.getElementById('bookCopies').value);

        if (isEditingBook) {
            const idx = books.findIndex(b => b.Book_ID === bookId);
            if (idx !== -1) {
                books[idx] = { Book_ID: bookId, Title: title, Author: author, Publisher: publisher, Year_of_Publication: year, Available_Copies: copies };
                setData('books', books);
                showToast('Book updated successfully!', 'success');
            }
        } else {
            // Check duplicate ID
            if (books.some(b => b.Book_ID === bookId)) {
                msgDiv.textContent = 'Book ID already exists!';
                msgDiv.className = 'form-message error';
                return;
            }
            books.push({ Book_ID: bookId, Title: title, Author: author, Publisher: publisher, Year_of_Publication: year, Available_Copies: copies });
            setData('books', books);
            showToast('Book added successfully!', 'success');
        }

        closeModal('addBookModal');
        renderBooksTable();
        renderDashboard();
    });

    // ==================== MEMBERS CRUD ====================
    function renderMembersTable(filter = '') {
        const tbody = document.querySelector('#allMembersTable tbody');
        tbody.innerHTML = '';

        const filtered = members.filter(m =>
            m.Name.toLowerCase().includes(filter.toLowerCase()) ||
            m.Email.toLowerCase().includes(filter.toLowerCase()) ||
            String(m.Member_ID).includes(filter)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No members found.</td></tr>';
            return;
        }

        filtered.forEach(member => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${member.Member_ID}</td>
                <td><span class="fw-bold">${escapeHtml(member.Name)}</span></td>
                <td>${escapeHtml(member.Email)}</td>
                <td>${member.Phone_Number}</td>
                <td>${formatDate(member.Membership_Date)}</td>
                <td>
                    <button class="action-btn delete delete-member-btn" data-id="${member.Member_ID}" title="Delete"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.delete-member-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteMember(parseInt(btn.dataset.id)));
        });
    }

    function deleteMember(id) {
        const member = members.find(m => m.Member_ID === id);
        if (!member) return;

        const hasIssues = issues.some(i => i.Member_ID === id && i.Return_Date === null);
        if (hasIssues) {
            showToast('Cannot delete — member has unreturned books!', 'error');
            return;
        }

        if (confirm(`Delete member "${member.Name}"?`)) {
            members = members.filter(m => m.Member_ID !== id);
            issues = issues.filter(i => i.Member_ID !== id);
            setData('members', members);
            setData('issues', issues);
            renderMembersTable();
            showToast('Member deleted!', 'success');
        }
    }

    document.getElementById('memberSearchInput').addEventListener('input', (e) => {
        renderMembersTable(e.target.value);
    });

    // Member Form
    const memberForm = document.getElementById('memberForm');

    function resetMemberForm() {
        memberForm.reset();
        document.getElementById('memberFormMessage').textContent = '';
        document.getElementById('memberFormMessage').className = 'form-message';
    }

    memberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('memberFormMessage');

        const memberId = parseInt(document.getElementById('memberIdInput').value);
        const name = document.getElementById('memberName').value.trim();
        const email = document.getElementById('memberEmail').value.trim();
        const phone = document.getElementById('memberPhone').value.trim();
        const date = document.getElementById('memberDate').value;

        // Check duplicates
        if (members.some(m => m.Member_ID === memberId)) {
            msgDiv.textContent = 'Member ID already exists!';
            msgDiv.className = 'form-message error';
            return;
        }
        if (members.some(m => m.Email.toLowerCase() === email.toLowerCase())) {
            msgDiv.textContent = 'Email already in use!';
            msgDiv.className = 'form-message error';
            return;
        }

        members.push({ Member_ID: memberId, Name: name, Email: email, Phone_Number: phone, Membership_Date: date });
        setData('members', members);
        closeModal('addMemberModal');
        renderMembersTable();
        renderDashboard();
        showToast('Member added successfully!', 'success');
    });

    // ==================== ISSUES CRUD ====================
    function renderIssuesTable(filter = '') {
        const tbody = document.querySelector('#allIssuesTable tbody');
        tbody.innerHTML = '';

        const today = new Date().toISOString().split('T')[0];

        const enriched = issues.map(issue => {
            const book = books.find(b => b.Book_ID === issue.Book_ID);
            const member = members.find(m => m.Member_ID === issue.Member_ID);
            return {
                ...issue,
                bookTitle: book ? book.Title : 'Unknown',
                memberName: member ? member.Name : 'Unknown'
            };
        });

        const filtered = enriched.filter(i =>
            i.bookTitle.toLowerCase().includes(filter.toLowerCase()) ||
            i.memberName.toLowerCase().includes(filter.toLowerCase()) ||
            String(i.Issue_ID).includes(filter)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No issues found.</td></tr>';
            return;
        }

        filtered.forEach(issue => {
            let statusClass, statusText;
            if (issue.Return_Date) {
                statusClass = 'returned';
                statusText = 'Returned';
            } else if (issue.Due_Date < today) {
                statusClass = 'overdue';
                statusText = 'Overdue';
            } else {
                statusClass = 'issued';
                statusText = 'Issued';
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${issue.Issue_ID}</td>
                <td><span class="fw-bold">${escapeHtml(issue.bookTitle)}</span></td>
                <td>${escapeHtml(issue.memberName)}</td>
                <td>${formatDate(issue.Issue_Date)}</td>
                <td>${formatDate(issue.Due_Date)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${!issue.Return_Date
                        ? `<button class="action-btn return-btn return-issue-btn" data-id="${issue.Issue_ID}" title="Return Book"><i class='bx bx-check-circle'></i></button>`
                        : '<span class="text-muted">—</span>'
                    }
                    <button class="action-btn delete delete-issue-btn" data-id="${issue.Issue_ID}" title="Delete"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach listeners
        tbody.querySelectorAll('.return-issue-btn').forEach(btn => {
            btn.addEventListener('click', () => returnBook(parseInt(btn.dataset.id)));
        });
        tbody.querySelectorAll('.delete-issue-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteIssue(parseInt(btn.dataset.id)));
        });
    }

    function returnBook(issueId) {
        const issue = issues.find(i => i.Issue_ID === issueId);
        if (!issue || issue.Return_Date) return;

        issue.Return_Date = new Date().toISOString().split('T')[0];

        // Restore available copy
        const book = books.find(b => b.Book_ID === issue.Book_ID);
        if (book) {
            book.Available_Copies += 1;
            setData('books', books);
        }

        setData('issues', issues);
        renderIssuesTable();
        renderDashboard();

        // Calculate fine
        const today = new Date();
        const dueDate = new Date(issue.Due_Date);
        if (today > dueDate) {
            const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
            const fine = daysLate * 5;
            showToast(`Book returned! Fine: ₹${fine} (${daysLate} days overdue)`, 'info');
        } else {
            showToast('Book returned successfully!', 'success');
        }
    }

    function deleteIssue(id) {
        if (confirm('Delete this issue record?')) {
            const issue = issues.find(i => i.Issue_ID === id);
            // If not returned, restore the copy
            if (issue && !issue.Return_Date) {
                const book = books.find(b => b.Book_ID === issue.Book_ID);
                if (book) {
                    book.Available_Copies += 1;
                    setData('books', books);
                }
            }
            issues = issues.filter(i => i.Issue_ID !== id);
            setData('issues', issues);
            renderIssuesTable();
            renderDashboard();
            showToast('Issue record deleted!', 'success');
        }
    }

    document.getElementById('issueSearchInput').addEventListener('input', (e) => {
        renderIssuesTable(e.target.value);
    });

    // Issue Form
    const issueForm = document.getElementById('issueForm');

    function resetIssueForm() {
        issueForm.reset();
        document.getElementById('issueFormMessage').textContent = '';
        document.getElementById('issueFormMessage').className = 'form-message';
    }

    function populateIssueSelects() {
        const bookSelect = document.getElementById('issueBookSelect');
        const memberSelect = document.getElementById('issueMemberSelect');

        bookSelect.innerHTML = '<option value="">-- Choose Book --</option>';
        memberSelect.innerHTML = '<option value="">-- Choose Member --</option>';

        books.filter(b => b.Available_Copies > 0).forEach(book => {
            const opt = document.createElement('option');
            opt.value = book.Book_ID;
            opt.textContent = `#${book.Book_ID} — ${book.Title} (${book.Available_Copies} copies)`;
            bookSelect.appendChild(opt);
        });

        members.forEach(member => {
            const opt = document.createElement('option');
            opt.value = member.Member_ID;
            opt.textContent = `#${member.Member_ID} — ${member.Name}`;
            memberSelect.appendChild(opt);
        });
    }

    issueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('issueFormMessage');

        const issueId = parseInt(document.getElementById('issueIdInput').value);
        const bookId = parseInt(document.getElementById('issueBookSelect').value);
        const memberId = parseInt(document.getElementById('issueMemberSelect').value);
        const librarianId = parseInt(document.getElementById('issueLibrarianId').value);
        const issueDate = document.getElementById('issueDateInput').value;
        const dueDate = document.getElementById('dueDateInput').value;

        // Validations
        if (issues.some(i => i.Issue_ID === issueId)) {
            msgDiv.textContent = 'Issue ID already exists!';
            msgDiv.className = 'form-message error';
            return;
        }

        if (dueDate <= issueDate) {
            msgDiv.textContent = 'Due date must be after issue date!';
            msgDiv.className = 'form-message error';
            return;
        }

        const book = books.find(b => b.Book_ID === bookId);
        if (!book || book.Available_Copies <= 0) {
            msgDiv.textContent = 'No copies available for this book!';
            msgDiv.className = 'form-message error';
            return;
        }

        // Decrease available copies (mirrors: UPDATE Books SET Available_Copies = Available_Copies - 1)
        book.Available_Copies -= 1;
        setData('books', books);

        issues.push({
            Issue_ID: issueId,
            Book_ID: bookId,
            Member_ID: memberId,
            Librarian_ID: librarianId,
            Issue_Date: issueDate,
            Due_Date: dueDate,
            Return_Date: null
        });
        setData('issues', issues);

        closeModal('issueBookModal');
        renderIssuesTable();
        renderDashboard();
        showToast('Book issued successfully!', 'success');
    });

    // ==================== GLOBAL SEARCH ====================
    document.getElementById('globalSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) return;

        // Determine which section has a match and navigate there
        const bookMatch = books.some(b =>
            b.Title.toLowerCase().includes(query) || b.Author.toLowerCase().includes(query)
        );
        const memberMatch = members.some(m =>
            m.Name.toLowerCase().includes(query) || m.Email.toLowerCase().includes(query)
        );

        const currentSection = document.querySelector('.nav-item.active')?.dataset.target;

        if (currentSection === 'books') {
            renderBooksTable(query);
        } else if (currentSection === 'members') {
            renderMembersTable(query);
        } else if (currentSection === 'issues') {
            renderIssuesTable(query);
        } else if (bookMatch) {
            navigateTo('books');
            document.getElementById('bookSearchInput').value = query;
            renderBooksTable(query);
        } else if (memberMatch) {
            navigateTo('members');
            document.getElementById('memberSearchInput').value = query;
            renderMembersTable(query);
        }
    });

    // ==================== UTILITY FUNCTIONS ====================
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ==================== INITIAL RENDER ====================
    renderDashboard();

});
