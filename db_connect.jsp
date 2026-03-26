<%@ page import="java.sql.*" %>
<%
    // db_connect.jsp
    // Oracle JDBC Connection Configuration
    
    // Database credentials and URLs
    String dbURL = "jdbc:oracle:thin:@localhost:1521:xe"; // Adjust 'xe' based on your Oracle SID
    String dbUser = "SYSTEM"; // Replace with your Oracle username
    String dbPassword = "password"; // Replace with your Oracle password
    
    Connection conn = null;
    
    try {
        // Load the Oracle JDBC Driver
        Class.forName("oracle.jdbc.driver.OracleDriver");
        
        // Establish Connection
        conn = DriverManager.getConnection(dbURL, dbUser, dbPassword);
        
    } catch (ClassNotFoundException e) {
        out.println("<script>console.error('Oracle JDBC Driver not found. Please ensure ojdbc.jar is added to the lib folder.');</script>");
        e.printStackTrace();
    } catch (SQLException e) {
        out.println("<script>console.error('Database connection failed: " + e.getMessage() + "');</script>");
        e.printStackTrace();
    }
%>
