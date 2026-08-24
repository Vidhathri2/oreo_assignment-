# Oreo Book Management System

A premium, enterprise-grade Book Management System built using Java/Spring Boot, SQL, HTML, CSS, and JavaScript. This project satisfies all requirements for Assessment 2.

## 🚀 Technology Stack
- **Backend**: Java 17, Spring Boot 3.2, Spring Web, Spring Data JPA
- **Database**: H2 (In-memory, default for easy testing) / PostgreSQL (Configurations provided)
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism, custom design system), Vanilla JavaScript
- **Testing**: JUnit 5, Mockito

## ✨ Highlights
- **Premium UI/UX**: Custom glassmorphism design, smooth transitions, modern typography.
- **Dynamic Frontend**: Single-page application feel using vanilla JS, DOM manipulation, real-time search filtering, and custom modals.
- **Robust Backend**: Exception handling via `@ControllerAdvice`, data validation, and clean layered architecture (Controller-Service-Repository).

---

## 🛠️ Prerequisites
- **Java 17** (or higher) must be installed.
- **JAVA_HOME** environment variable must be set pointing to your JDK installation.

---

## 🏃 Getting Started (How to Run)

### 1. Database Configuration
By default, the application runs using an **in-memory H2 database** to ensure immediate usability without complex setup. It automatically seeds initial data on startup.

*(Optional)* If you wish to use **PostgreSQL**, open `src/main/resources/application.properties`, comment out the H2 settings, and uncomment the PostgreSQL settings. Make sure you have a database named `book_db` running on localhost:5432.

### 2. Running the Application on Windows

Open your terminal (PowerShell or Command Prompt), navigate to the `book-management-system` folder, and run:

```powershell
# Ensure you are in the correct directory
cd "path\to\book-management-system"

# (Optional) If you face a JAVA_HOME error and have a portable/existing JDK, set it like this for the session:
# $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.7-hotspot"

# Run the Spring Boot application using the Maven wrapper
.\mvnw.cmd spring-boot:run
```

### 3. Running the Application on Mac/Linux

```bash
cd book-management-system
./mvnw spring-boot:run
```

Once the application starts, open your web browser and navigate to:
👉 **http://localhost:8080**

---

## 🧪 How to Run Tests

The project includes an automated test suite utilizing JUnit 5 and Mockito to ensure code reliability. It tests CRUD operations, borrowing, returning, and validation scenarios.

To execute the test suite, run the following command in your terminal:

**Windows:**
```powershell
.\mvnw.cmd test
```

**Mac/Linux:**
```bash
./mvnw test
```

You can view the detailed test results directly in your terminal console.

---

## 🔌 API Endpoints
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get a book by ID
- `POST /api/books` - Create a new book
- `PUT /api/books/{id}` - Update a book
- `DELETE /api/books/{id}` - Delete a book
- `GET /api/books/search?query=...` - Search books
- `POST /api/books/{id}/borrow?borrowerId=...` - Borrow a book
- `POST /api/books/{id}/return?borrowerId=...` - Return a book

---

## 📦 Deliverables Included
- **Git Repository**: Initialized locally with commit history.
- **README**: Detailed setup instructions (this file).
- **Database Scripts**: Included in `database-scripts.sql` (schema + requested queries).
- **APIs & UI**: Integrated and accessible via `http://localhost:8080`.
- **Tests**: Located in `src/test/java/com/assignment/bookmanagement/service/BookServiceTest.java`.
