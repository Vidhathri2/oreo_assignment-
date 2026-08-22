# Oreo Book Management System

A premium, enterprise-grade Book Management System built using Java/Spring Boot, SQL, HTML, CSS, and JavaScript. This project satisfies all requirements for Assessment 2.

## Technology Stack
- **Backend**: Java 17, Spring Boot 3.2, Spring Web, Spring Data JPA
- **Database**: H2 (In-memory, default for easy testing) / PostgreSQL (Configurations provided)
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism, custom design system), Vanilla JavaScript
- **Testing**: JUnit 5, Mockito

## Highlights
- **Premium UI/UX**: Custom glassmorphism design, smooth transitions, modern typography, and a dark mode toggle.
- **Dynamic Frontend**: Single-page application feel using vanilla JS, DOM manipulation, real-time search filtering, and custom modals.
- **Robust Backend**: Exception handling via `@ControllerAdvice`, data validation, and clean layered architecture (Controller-Service-Repository).

## Getting Started

### 1. Database Configuration
By default, the application runs using an **in-memory H2 database** to ensure immediate usability without complex setup. It automatically seeds initial data on startup.

If you wish to use **PostgreSQL**, open `src/main/resources/application.properties`, comment out the H2 settings, and uncomment the PostgreSQL settings. Make sure you have a database named `book_db` running on localhost:5432.

### 2. Running the Application
From the `book-management-system` root directory, execute:
```bash
./mvnw spring-boot:run
```
*(If you are on Windows and don't have Maven installed, use the included Maven wrapper, or run via your IDE).*

Once the application starts, access the UI at:
**http://localhost:8080**

### 3. Running Tests
Run the JUnit 5 test suite using:
```bash
./mvnw test
```
*(Tests cover CRUD, borrowing, returning, and unavailable-book scenarios).*

## API Endpoints
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get a book by ID
- `POST /api/books` - Create a new book
- `PUT /api/books/{id}` - Update a book
- `DELETE /api/books/{id}` - Delete a book
- `GET /api/books/search?query=...` - Search books
- `POST /api/books/{id}/borrow?borrowerId=...` - Borrow a book
- `POST /api/books/{id}/return?borrowerId=...` - Return a book

## Deliverables Included
- **Git Repository**: Initialized locally.
- **README**: Detailed setup instructions.
- **Database Scripts**: Included in `database-scripts.sql` (schema + requested queries).
- **APIs & UI**: Integrated and accessible via `http://localhost:8080`.
- **Tests**: Located in `src/test/java/com/assignment/bookmanagement/BookServiceTest.java`.
- **Screenshots**: Please capture screenshots of the dashboard and book catalog from `http://localhost:8080` for your submission.

## Note on Architecture
The UI is built with extreme attention to detail, utilizing CSS Variables, flexbox/grid architectures, and modern UI paradigms to give it a unique, professional look avoiding standard template appearances.
