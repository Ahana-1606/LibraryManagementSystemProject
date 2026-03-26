-- ==========================================================
-- LIBRARY MANAGEMENT SYSTEM - DATABASE SCHEMA & QUERIES
-- Compatible with Oracle 10g/11g 
-- Roll No: 24051233
-- ==========================================================

-- PART A: DATABASE SCHEMA DESIGN
-- 1. Books Table
CREATE TABLE Books (
    Book_ID INT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255) NOT NULL,
    Publisher VARCHAR(255),
    Year_of_Publication INT,
    Available_Copies INT DEFAULT 0
);

-- 2. Members Table
CREATE TABLE Members (
    Member_ID INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE,
    Phone_Number VARCHAR(20),
    Membership_Date DATE
);

-- 3. Librarians Table
CREATE TABLE Librarians (
    Librarian_ID INT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Contact_Details VARCHAR(255)
);

-- 4. Issues Table
CREATE TABLE Issues (
    Issue_ID INT PRIMARY KEY,
    Book_ID INT,
    Member_ID INT,
    Librarian_ID INT,
    Issue_Date DATE,
    Due_Date DATE,
    Return_Date DATE,
    FOREIGN KEY (Book_ID) REFERENCES Books(Book_ID),
    FOREIGN KEY (Member_ID) REFERENCES Members(Member_ID),
    FOREIGN KEY (Librarian_ID) REFERENCES Librarians(Librarian_ID)
);

-- ==========================================================
-- Dummy Data Insertion (Optional but helpful for testing)
-- ==========================================================
INSERT INTO Books VALUES (1, 'Database System Concepts', 'Silberschatz', 'McGraw Hill', 2019, 5);
INSERT INTO Books VALUES (2, 'Introduction to Algorithms', 'Cormen', 'MIT Press', 2009, 3);

INSERT INTO Members VALUES (1, 'Prateek', 'prateek@example.com', '9876543210', TO_DATE('2023-01-15', 'YYYY-MM-DD'));
INSERT INTO Members VALUES (2, 'Rahul', 'rahul@example.com', '9988776655', TO_DATE('2024-02-10', 'YYYY-MM-DD'));

INSERT INTO Librarians VALUES (1, 'Mr. Sharma', 'sharma@library.com');

INSERT INTO Issues VALUES (1, 1, 1, 1, TO_DATE('2024-03-01', 'YYYY-MM-DD'), TO_DATE('2024-03-15', 'YYYY-MM-DD'), NULL);
INSERT INTO Issues VALUES (2, 2, 2, 1, TO_DATE('2023-11-01', 'YYYY-MM-DD'), TO_DATE('2023-11-15', 'YYYY-MM-DD'), TO_DATE('2023-11-16', 'YYYY-MM-DD'));


-- ==========================================================
-- PART B: SQL QUERIES
-- ==========================================================

-- Q2. Display all the records from the Books table.
SELECT * FROM Books;

-- Q3. Retrieve details of all members who joined after a specific date.
SELECT * FROM Members 
WHERE Membership_Date > TO_DATE('2023-12-31', 'YYYY-MM-DD');

-- Q4. Find all books written by a particular author.
SELECT * FROM Books 
WHERE Author = 'Silberschatz';

-- Q5. List all books that are currently issued and not yet returned.
SELECT b.* 
FROM Books b
JOIN Issues i ON b.Book_ID = i.Book_ID
WHERE i.Return_Date IS NULL;

-- Q6. Display details of overdue books (where due date has passed and the book is not returned).
SELECT * 
FROM Issues 
WHERE Due_Date < SYSDATE AND Return_Date IS NULL;

-- Q7. Count the total number of books available in the library.
-- (Assuming this means total count of all copies)
SELECT SUM(Available_Copies) AS Total_Books_Available 
FROM Books;

-- Q8. Show the list of books issued by a particular member.
SELECT b.Title 
FROM Books b
JOIN Issues i ON b.Book_ID = i.Book_ID
WHERE i.Member_ID = 1;

-- Q9. Find the number of books issued by each member.
SELECT Member_ID, COUNT(Issue_ID) AS Total_Issued 
FROM Issues 
GROUP BY Member_ID;

-- Q10. Retrieve the most issued book in the library.
-- Using ROWNUM for Oracle 10g/11g compatibility
SELECT Book_ID, Issue_Count 
FROM (
    SELECT Book_ID, COUNT(Issue_ID) AS Issue_Count 
    FROM Issues 
    GROUP BY Book_ID 
    ORDER BY Issue_Count DESC
) 
WHERE ROWNUM = 1;

-- Q11. Calculate the fine for each overdue book assuming ₹5 per day after the due date.
-- In Oracle, subtracting two dates gives difference in days.
SELECT Issue_ID, 
       (TRUNC(SYSDATE) - TRUNC(Due_Date)) * 5 AS Fine_Amount
FROM Issues 
WHERE Return_Date IS NULL AND Due_Date < SYSDATE;


-- ==========================================================
-- PART C: ADVANCED QUERIES
-- ==========================================================

-- Q12. Display book title, member name, and issue date using JOIN.
SELECT b.Title, m.Name AS Member_Name, i.Issue_Date 
FROM Issues i
JOIN Books b ON i.Book_ID = b.Book_ID
JOIN Members m ON i.Member_ID = m.Member_ID;

-- Q13. Find members who have not issued any books.
SELECT * 
FROM Members 
WHERE Member_ID NOT IN (SELECT NVL(Member_ID, 0) FROM Issues);

-- Q14. Update the available copies of a book after issuing it.
-- Issue a book (Book_ID 1)
UPDATE Books 
SET Available_Copies = Available_Copies - 1 
WHERE Book_ID = 1 AND Available_Copies > 0;

-- Q15. Delete records of members who have not issued any books for the last 2 years.
DELETE FROM Members 
WHERE Member_ID NOT IN (
    SELECT Member_ID 
    FROM Issues 
    WHERE Issue_Date >= ADD_MONTHS(SYSDATE, -24)
);
