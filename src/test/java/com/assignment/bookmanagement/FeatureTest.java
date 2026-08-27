package com.assignment.bookmanagement;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import com.assignment.bookmanagement.service.BookService;
import com.assignment.bookmanagement.model.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FeatureTest {
    @Autowired BookService bookService;
    @Test
    void testReturn() {
        System.out.println("TESTING RETURN FEATURE");
        // Borrow book 1 by borrower 1
        BorrowRecord rec = bookService.borrowBook(1L, 1L);
        assertNotNull(rec);
        // Return it
        BorrowRecord rec2 = bookService.returnBook(1L, 1L);
        assertNotNull(rec2.getReturnDate());
        System.out.println("RETURN WORKED");
    }
}
