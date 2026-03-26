<%@ page import="java.sql.*" %>
<%@ include file="db_connect.jsp" %>
<%
    // Add Book Action Handler
    String status = "error";
    String message = "Unknown error occurred.";

    // Only process if it is a POST request
    if (request.getMethod().equalsIgnoreCase("POST")) {
        // Retrieve form parameters
        String bookIdStr = request.getParameter("bookId");
        String title = request.getParameter("title");
        String author = request.getParameter("author");
        String publisher = request.getParameter("publisher");
        String yearStr = request.getParameter("year");
        String copiesStr = request.getParameter("copies");

        if (conn != null && bookIdStr != null && title != null && author != null) {
            PreparedStatement pstmt = null;
            try {
                int bookId = Integer.parseInt(bookIdStr);
                int year = Integer.parseInt(yearStr);
                int copies = Integer.parseInt(copiesStr);

                // SQL Query to Insert Book
                String sql = "INSERT INTO Books (Book_ID, Title, Author, Publisher, Year_of_Publication, Available_Copies) VALUES (?, ?, ?, ?, ?, ?)";
                pstmt = conn.prepareStatement(sql);
                pstmt.setInt(1, bookId);
                pstmt.setString(2, title);
                pstmt.setString(3, author);
                pstmt.setString(4, publisher);
                pstmt.setInt(5, year);
                pstmt.setInt(6, copies);

                int rowsInserted = pstmt.executeUpdate();
                if (rowsInserted > 0) {
                    status = "success";
                    message = "Book added successfully!";
                }

            } catch (Exception e) {
                message = "Database Error: " + e.getMessage();
                e.printStackTrace();
            } finally {
                if (pstmt != null) try { pstmt.close(); } catch (SQLException ignore) {}
            }
        } else {
            message = "Missing required fields or database not connected.";
        }
        
        // Return JSON response equivalent
        response.setContentType("application/json");
        out.print("{\"status\":\"" + status + "\", \"message\":\"" + message.replace("\"", "\\\"") + "\"}");
    } else {
        response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, "POST method required by AddBookAction.");
    }
%>
