-- Database Scripts for Assessment 2 - Online Book Management System
-- Database: PostgreSQL

-- Note: In the Spring Boot application, `spring.jpa.hibernate.ddl-auto=update` is used,
-- so Hibernate will automatically generate these tables.
-- Below is the manual SQL equivalent for the schema and required queries.

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE borrowers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NOT NULL,
    available_copies INTEGER NOT NULL,
    total_copies INTEGER NOT NULL,
    author_id INTEGER NOT NULL REFERENCES authors(id),
    category_id INTEGER NOT NULL REFERENCES categories(id)
);

CREATE TABLE borrow_records (
    id SERIAL PRIMARY KEY,
    borrow_date DATE NOT NULL,
    return_date DATE,
    book_id INTEGER NOT NULL REFERENCES books(id),
    borrower_id INTEGER NOT NULL REFERENCES borrowers(id)
);

-- SQL Tasks Queries
-- 1. Find all available books
SELECT * FROM books WHERE available_copies > 0;

-- 2. Find books by author
SELECT b.* FROM books b JOIN authors a ON b.author_id = a.id WHERE a.name = 'J.K. Rowling';

-- 3. Count books by category
SELECT c.name, COUNT(b.id) as book_count 
FROM categories c 
LEFT JOIN books b ON c.id = b.category_id 
GROUP BY c.name;

-- 4. Find currently borrowed books
SELECT b.* 
FROM books b 
JOIN borrow_records br ON b.id = br.book_id 
WHERE br.return_date IS NULL;

-- 5. Find the most borrowed book
SELECT b.title, COUNT(br.id) as borrow_count 
FROM books b 
JOIN borrow_records br ON b.id = br.book_id 
GROUP BY b.id, b.title 
ORDER BY borrow_count DESC 
LIMIT 1;
