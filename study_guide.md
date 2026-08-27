# Deep Dive: How the Code Works (Step-by-Step)

This guide explains **exactly** how the application runs, which file is the "main" file, how the files communicate with each other, and **why** it is designed this way. 

---

## 1. The Starting Point (The Main File)
In Java Spring Boot, the absolute starting point of your entire application is:
**`src/main/java/com/assignment/bookmanagement/BookManagementApplication.java`**

Inside this file, you will find a `public static void main(String[] args)` method. This is the exact same `main` method as any basic Java program. 
The magic happens with the `@SpringBootApplication` annotation above the class. When you run this file, Spring Boot wakes up, scans all of your other folders, sets up a web server (Tomcat) on port `8085`, connects to the in-memory database (H2), and waits for web requests.

---

## 2. A Complete Execution Trace: "Borrowing a Book"
To understand how one file calls another, let's trace a single action: **Borrowing a book.** We will follow the data from the exact moment you click the button on the website down to the database.

### Step 1: The User Clicks the Button (Frontend)
*   **File:** `src/main/resources/static/js/app.js`
*   **What happens:** When you select a borrower in the pop-up modal and click "Confirm", the browser triggers the `confirmBorrow()` JavaScript function.
*   **The Code:**
    ```javascript
    window.confirmBorrow = async function () {
        const borId = document.getElementById('borrowerSelect').value;
        // The javascript manually creates a network request targeting our backend API
        const res = await fetch(`/api/books/${state.currentActionBookId}/borrow?borrowerId=${borId}`, { method: 'POST' });
        // ...
    ```
*   **Why we do this:** The frontend (browser) cannot talk to the database directly for security reasons. It must ask the backend to do it via an HTTP `POST` request.

### Step 2: The Controller Catches the Request
*   **File:** `src/main/java/com/assignment/bookmanagement/controller/BookController.java`
*   **What happens:** The backend receives the HTTP request at `/api/books/1/borrow`. Spring Boot looks through all classes annotated with `@RestController` to find the one handling this specific URL.
*   **The Code:**
    ```java
    @PostMapping("/{id}/borrow") // Matches /api/books/{id}/borrow
    public ResponseEntity<?> borrowBook(@PathVariable Long id, @RequestParam Long borrowerId) {
        // The controller delegates the actual work to the BookService
        return ResponseEntity.ok(bookService.borrowBook(id, borrowerId));
    }
    ```
*   **Why we do this:** The Controller acts as a traffic cop. Its *only* job is to receive the HTTP web request, extract the variables (`id` and `borrowerId`), and hand them off to the Service Layer. We do not write database logic here to keep the code clean.

### Step 3: The Service Executes the Rules (Business Logic)
*   **File:** `src/main/java/com/assignment/bookmanagement/service/BookService.java`
*   **What happens:** The `BookController` calls `bookService.borrowBook(id, borrowerId)`. This file contains the strict "Business Rules" of your application.
*   **The Code:**
    ```java
    @Transactional // If anything fails, undo all database changes instantly
    public BorrowRecord borrowBook(Long bookId, Long borrowerId) {
        // 1. Ask the repository to find the book
        Book book = bookRepository.findById(bookId).orElseThrow(...);
        
        // 2. Business Rule: Are there available copies?
        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Book is out of stock");
        }
        
        // 3. Modify the book
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book); // Save the updated count
        
        // 4. Create a receipt (BorrowRecord)
        BorrowRecord record = new BorrowRecord();
        record.setBook(book);
        record.setBorrower(borrower);
        record.setBorrowDate(LocalDateTime.now());
        
        return borrowRecordRepository.save(record);
    }
    ```
*   **Why we do this:** The `@Service` layer is the "brain" of the app. If you ever need to change the rules (e.g., "A user can only borrow 3 books maximum"), you only change the code here. The Controller doesn't care *how* a book is borrowed, it just tells the Service to do it.

### Step 4: The Repository Talks to the Database
*   **File:** `src/main/java/com/assignment/bookmanagement/repository/BookRepository.java`
*   **What happens:** Inside the Service, we called `bookRepository.save(book)`. 
*   **The Code:**
    ```java
    public interface BookRepository extends JpaRepository<Book, Long> {
        // That's it! No code required.
    }
    ```
*   **Why we do this:** You don't have to write complex `INSERT INTO books ...` SQL queries. By extending `JpaRepository`, Spring Boot automatically generates the SQL to save, update, delete, and find `Book` objects behind the scenes. 
*   **How does it know what a Book is?** It looks at `src/main/java/com/assignment/bookmanagement/model/Book.java`. The `@Entity` and `@Table(name="books")` annotations tell the system exactly what columns the database table should have.

### Step 5: The Response Returns to the User
*   **What happens:** 
    1. The `BorrowRecordRepository` successfully saves the row to the H2 Database.
    2. It hands the saved `BorrowRecord` back up to the `BookService`.
    3. The `BookService` hands it back up to the `BookController`.
    4. The `BookController` packages it into a `200 OK` HTTP Response and sends it over the internet back to the browser.
    5. Back in `app.js`, the code continues:
    ```javascript
        if (res.ok) {
            showToast('Book issued successfully', 'success'); // Shows the green popup
            closeModal('borrowModal'); // Hides the popup box
            fetchInitialData(); // Refreshes the tables so the "Available Copies" number goes down by 1 instantly!
        }
    ```

---

## Why is the code separated into so many files? (Separation of Concerns)

You might wonder, *"Why not put everything in one giant file?"* 

This architecture is called **Separation of Concerns**. We divide the application into layers:

1. **Model Layer (`/model`)**: Defines what the data looks like (Books, Authors). 
2. **Repository Layer (`/repository`)**: Handles exactly *how* to save/fetch data from the SQL database.
3. **Service Layer (`/service`)**: Handles the strict real-world rules (e.g., checking stock).
4. **Controller Layer (`/controller`)**: Handles internet communication (converting JSON from the web into Java objects).
5. **View Layer (`app.js` / `index.html`)**: Handles what the human actually sees and clicks on.

**Why?** 
*   **Maintainability:** If you decide to switch your database from H2 to PostgreSQL, you only touch the `application.properties` and maybe the `Repository`. The `Controller` and `Service` literally do not know (or care) what database you are using.
*   **Testability:** You can write a test for `BookService.java` to ensure the math for `availableCopies` works properly without needing to spin up a web server or a real database.
