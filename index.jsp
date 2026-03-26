<%@ page import="java.sql.*" %>
<%@ include file="db_connect.jsp" %>
<%
    // Initialize Dashboard Statistics
    int totalBooks = 0;
    int activeMembers = 0;
    int issuedBooks = 0;
    int overdueReturns = 0;

    if (conn != null) {
        Statement stmt = conn.createStatement();
        ResultSet rs;

        // Total Books
        try {
            rs = stmt.executeQuery("SELECT SUM(Available_Copies) AS Total FROM Books");
            if (rs.next()) totalBooks = rs.getInt("Total");
        } catch (Exception ignore) {}

        // Active Members
        try {
            rs = stmt.executeQuery("SELECT COUNT(*) AS Total FROM Members");
            if (rs.next()) activeMembers = rs.getInt("Total");
        } catch (Exception ignore) {}

        // Issued Books
        try {
            rs = stmt.executeQuery("SELECT COUNT(*) AS Total FROM Issues WHERE Return_Date IS NULL");
            if (rs.next()) issuedBooks = rs.getInt("Total");
        } catch (Exception ignore) {}

        // Overdue Returns
        try {
            rs = stmt.executeQuery("SELECT COUNT(*) AS Total FROM Issues WHERE Due_Date < SYSDATE AND Return_Date IS NULL");
            if (rs.next()) overdueReturns = rs.getInt("Total");
        } catch (Exception ignore) {}
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NexLib | Premium Library Management</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
    <!-- Boxicons for Icons -->
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="glass-background"></div>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
    <div class="glow glow-3"></div>

    <div class="app-container glass-panel">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">
                <i class='bx bx-book-reader'></i>
                <h2>NexLib</h2>
            </div>
            
            <nav class="nav-menu">
                <a href="#" class="nav-item active" data-target="dashboard">
                    <i class='bx bx-grid-alt'></i>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="nav-item" data-target="books">
                    <i class='bx bx-book'></i>
                    <span>Books</span>
                </a>
                <a href="#" class="nav-item" data-target="members">
                    <i class='bx bx-user'></i>
                    <span>Members</span>
                </a>
                <a href="#" class="nav-item" data-target="issues">
                    <i class='bx bx-receipt'></i>
                    <span>Issues & Returns</span>
                </a>
            </nav>

            <div class="user-profile">
                <img src="https://ui-avatars.com/api/?name=Admin&background=6b46c1&color=fff" alt="Admin Profile">
                <div class="user-info">
                    <h4>Admin User</h4>
                    <p>Librarian</p>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="top-header">
                <div class="search-bar">
                    <i class='bx bx-search'></i>
                    <input type="text" placeholder="Search books, members, issues...">
                </div>
                <div class="header-actions">
                    <button class="icon-btn"><i class='bx bx-bell'></i><span class="badge">3</span></button>
                    <button class="btn primary-btn" id="addBookBtn"><i class='bx bx-plus'></i> Add Book</button>
                </div>
            </header>

            <div class="content-area">
                <!-- Dashboard Statistics -->
                <div class="stats-grid">
                    <div class="stat-card glass-panel inner">
                        <div class="stat-icon purple"><i class='bx bx-book-open'></i></div>
                        <div class="stat-details">
                            <h3>Total Books</h3>
                            <p class="stat-number" data-target="<%= totalBooks %>">0</p>
                        </div>
                    </div>
                    <div class="stat-card glass-panel inner">
                        <div class="stat-icon blue"><i class='bx bx-user-check'></i></div>
                        <div class="stat-details">
                            <h3>Active Members</h3>
                            <p class="stat-number" data-target="<%= activeMembers %>">0</p>
                        </div>
                    </div>
                    <div class="stat-card glass-panel inner">
                        <div class="stat-icon orange"><i class='bx bx-book-bookmark'></i></div>
                        <div class="stat-details">
                            <h3>Issued Books</h3>
                            <p class="stat-number" data-target="<%= issuedBooks %>">0</p>
                        </div>
                    </div>
                    <div class="stat-card glass-panel inner">
                        <div class="stat-icon red"><i class='bx bx-error-circle'></i></div>
                        <div class="stat-details">
                            <h3>Overdue Returns</h3>
                            <p class="stat-number" data-target="<%= overdueReturns %>">0</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Books Table Section -->
                <section class="table-section glass-panel inner">
                    <div class="section-header">
                        <h2>Library Books Database</h2>
                        <button class="view-all" onclick="window.location.reload();">Refresh Data <i class='bx bx-refresh'></i></button>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Book ID</th>
                                    <th>Title & Info</th>
                                    <th>Author</th>
                                    <th>Publisher</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <%
                                    if (conn != null) {
                                        try {
                                            Statement stmt = conn.createStatement();
                                            ResultSet rs = stmt.executeQuery("SELECT * FROM Books ORDER BY Book_ID DESC FETCH FIRST 10 ROWS ONLY");
                                            
                                            boolean hasBooks = false;
                                            while(rs.next()) {
                                                hasBooks = true;
                                                int id = rs.getInt("Book_ID");
                                                String title = rs.getString("Title");
                                                String author = rs.getString("Author");
                                                String publisher = rs.getString("Publisher");
                                                int year = rs.getInt("Year_of_Publication");
                                                int copies = rs.getInt("Available_Copies");
                                %>
                                <tr>
                                    <td>#<%= id %></td>
                                    <td>
                                        <span class="fw-bold"><%= title %></span><br>
                                        <small class="text-muted"><%= year %> &bull; <%= copies %> Copies</small>
                                    </td>
                                    <td><%= author %></td>
                                    <td><%= publisher %></td>
                                    <td>
                                        <% if(copies > 0) { %>
                                            <span class="status-badge available">Available</span>
                                        <% } else { %>
                                            <span class="status-badge issued">Out of Stock</span>
                                        <% } %>
                                    </td>
                                    <td>
                                        <button class="action-btn"><i class='bx bx-edit-alt'></i></button>
                                        <button class="action-btn delete"><i class='bx bx-trash'></i></button>
                                    </td>
                                </tr>
                                <%
                                            }
                                            if(!hasBooks) {
                                                out.println("<tr><td colspan='6' style='text-align:center;'>No books found in the database. Add some!</td></tr>");
                                            }
                                        } catch (Exception e) {
                                            out.println("<tr><td colspan='6' style='color:red;'>Error fetching database records: " + e.getMessage() + "</td></tr>");
                                        }
                                    } else {
                                        out.println("<tr><td colspan='6' class='text-muted'>Database is not connected. This table will be empty.</td></tr>");
                                    }
                                %>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- Add Book Modal -->
    <div class="modal-overlay" id="addBookModal">
        <div class="modal glass-panel">
            <div class="modal-header">
                <h2>Add New Book</h2>
                <button class="close-btn" id="closeModalBtn"><i class='bx bx-x'></i></button>
            </div>
            <!-- The form is now hooked to be sent via JavaScript to addBookAction.jsp -->
            <form class="modal-form" id="newBookForm">
                <div class="form-group row">
                    <div class="input-field">
                        <label>Book ID</label>
                        <input type="number" name="bookId" placeholder="e.g. 1048" required>
                    </div>
                    <div class="input-field">
                        <label>Available Copies</label>
                        <input type="number" name="copies" placeholder="5" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" placeholder="Enter book title" required>
                </div>
                <div class="form-group row">
                    <div class="input-field">
                        <label>Author</label>
                        <input type="text" name="author" placeholder="Author name" required>
                    </div>
                    <div class="input-field">
                        <label>Publisher</label>
                        <input type="text" name="publisher" placeholder="Publisher name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Year of Publication</label>
                    <input type="number" name="year" placeholder="YYYY" required>
                </div>
                <div id="formMessage" style="color:var(--danger); font-size:12px; margin-bottom:10px;"></div>
                <button type="submit" class="btn primary-btn submit-btn">Save Book</button>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
