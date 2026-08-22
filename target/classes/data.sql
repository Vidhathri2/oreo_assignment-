INSERT INTO authors (name) VALUES ('J.K. Rowling');
INSERT INTO authors (name) VALUES ('George R.R. Martin');
INSERT INTO authors (name) VALUES ('J.R.R. Tolkien');

INSERT INTO categories (name) VALUES ('Fantasy');
INSERT INTO categories (name) VALUES ('Science Fiction');
INSERT INTO categories (name) VALUES ('Adventure');

INSERT INTO borrowers (name, email) VALUES ('Alice Smith', 'alice@example.com');
INSERT INTO borrowers (name, email) VALUES ('Bob Jones', 'bob@example.com');
INSERT INTO borrowers (name, email) VALUES ('Charlie Brown', 'charlie@example.com');

INSERT INTO books (title, isbn, available_copies, total_copies, author_id, category_id) VALUES ('Harry Potter and the Sorcerer''s Stone', '978-0590353427', 5, 5, 1, 1);
INSERT INTO books (title, isbn, available_copies, total_copies, author_id, category_id) VALUES ('A Game of Thrones', '978-0553103540', 3, 3, 2, 1);
INSERT INTO books (title, isbn, available_copies, total_copies, author_id, category_id) VALUES ('The Hobbit', '978-0547928227', 2, 2, 3, 3);
