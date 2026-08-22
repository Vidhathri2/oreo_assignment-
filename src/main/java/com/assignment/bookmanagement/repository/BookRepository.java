package com.assignment.bookmanagement.repository;

import com.assignment.bookmanagement.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Find all available books
    List<Book> findByAvailableCopiesGreaterThan(int availableCopies);
    
    // Find books by author
    List<Book> findByAuthorId(Long authorId);
    
    // Search by title or isbn
    List<Book> findByTitleContainingIgnoreCaseOrIsbnContainingIgnoreCase(String title, String isbn);

    // Count books by category (Returns List of Object array where [0] is category name and [1] is count)
    @Query("SELECT c.name, COUNT(b) FROM Book b JOIN b.category c GROUP BY c.name")
    List<Object[]> countBooksByCategory();

    // Find the most borrowed book
    @Query(value = "SELECT b.* FROM books b JOIN borrow_records br ON b.id = br.book_id GROUP BY b.id ORDER BY COUNT(br.id) DESC LIMIT 1", nativeQuery = true)
    Book findMostBorrowedBook();
}
