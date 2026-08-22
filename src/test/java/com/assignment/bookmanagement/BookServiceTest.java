package com.assignment.bookmanagement;

import com.assignment.bookmanagement.exception.BadRequestException;
import com.assignment.bookmanagement.model.Author;
import com.assignment.bookmanagement.model.Book;
import com.assignment.bookmanagement.model.BorrowRecord;
import com.assignment.bookmanagement.model.Borrower;
import com.assignment.bookmanagement.model.Category;
import com.assignment.bookmanagement.repository.BookRepository;
import com.assignment.bookmanagement.repository.BorrowRecordRepository;
import com.assignment.bookmanagement.repository.BorrowerRepository;
import com.assignment.bookmanagement.service.BookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private BorrowRecordRepository borrowRecordRepository;

    @Mock
    private BorrowerRepository borrowerRepository;

    @InjectMocks
    private BookService bookService;

    private Book book;
    private Borrower borrower;
    private Author author;
    private Category category;

    @BeforeEach
    void setUp() {
        author = new Author();
        author.setId(1L);
        author.setName("Test Author");

        category = new Category();
        category.setId(1L);
        category.setName("Test Category");

        book = new Book();
        book.setId(1L);
        book.setTitle("Test Book");
        book.setIsbn("1234567890");
        book.setAvailableCopies(2);
        book.setTotalCopies(2);
        book.setAuthor(author);
        book.setCategory(category);

        borrower = new Borrower();
        borrower.setId(1L);
        borrower.setName("Test Borrower");
        borrower.setEmail("test@example.com");
    }

    @Test
    void testGetAllBooks() {
        when(bookRepository.findAll()).thenReturn(Arrays.asList(book));
        List<Book> books = bookService.getAllBooks();
        assertEquals(1, books.size());
        verify(bookRepository, times(1)).findAll();
    }

    @Test
    void testGetBookById() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        Book found = bookService.getBookById(1L);
        assertNotNull(found);
        assertEquals("Test Book", found.getTitle());
    }

    @Test
    void testCreateBook() {
        when(bookRepository.save(any(Book.class))).thenReturn(book);
        Book created = bookService.createBook(book);
        assertNotNull(created);
        assertEquals("Test Book", created.getTitle());
    }

    @Test
    void testUpdateBook() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        Book updateDetails = new Book();
        updateDetails.setTitle("Updated Book");
        updateDetails.setIsbn("0987654321");
        updateDetails.setAvailableCopies(5);
        updateDetails.setTotalCopies(5);
        updateDetails.setAuthor(author);
        updateDetails.setCategory(category);

        Book updated = bookService.updateBook(1L, updateDetails);
        assertEquals("Updated Book", updated.getTitle());
        assertEquals("0987654321", updated.getIsbn());
    }

    @Test
    void testDeleteBook() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        doNothing().when(bookRepository).delete(book);

        bookService.deleteBook(1L);
        verify(bookRepository, times(1)).delete(book);
    }

    @Test
    void testBorrowBookSuccess() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(borrowerRepository.findById(1L)).thenReturn(Optional.of(borrower));
        when(borrowRecordRepository.findByBookIdAndBorrowerIdAndReturnDateIsNull(1L, 1L))
                .thenReturn(Optional.empty());

        BorrowRecord mockRecord = new BorrowRecord();
        mockRecord.setId(1L);
        mockRecord.setBook(book);
        mockRecord.setBorrower(borrower);

        when(borrowRecordRepository.save(any(BorrowRecord.class))).thenReturn(mockRecord);
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        BorrowRecord record = bookService.borrowBook(1L, 1L);

        assertNotNull(record);
        assertEquals(1, book.getAvailableCopies()); // Decreased from 2 to 1
        verify(bookRepository, times(1)).save(book);
        verify(borrowRecordRepository, times(1)).save(any(BorrowRecord.class));
    }

    @Test
    void testBorrowBookUnavailable() {
        book.setAvailableCopies(0);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThrows(BadRequestException.class, () -> bookService.borrowBook(1L, 1L));
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void testBorrowBookAlreadyBorrowed() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(borrowerRepository.findById(1L)).thenReturn(Optional.of(borrower));
        
        BorrowRecord existingRecord = new BorrowRecord();
        when(borrowRecordRepository.findByBookIdAndBorrowerIdAndReturnDateIsNull(1L, 1L))
                .thenReturn(Optional.of(existingRecord));

        assertThrows(BadRequestException.class, () -> bookService.borrowBook(1L, 1L));
    }

    @Test
    void testReturnBookSuccess() {
        book.setAvailableCopies(1); // Set to 1, should increase to 2
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        
        BorrowRecord activeRecord = new BorrowRecord();
        activeRecord.setId(1L);
        activeRecord.setBook(book);
        activeRecord.setBorrower(borrower);

        when(borrowRecordRepository.findByBookIdAndBorrowerIdAndReturnDateIsNull(1L, 1L))
                .thenReturn(Optional.of(activeRecord));
        when(borrowRecordRepository.save(any(BorrowRecord.class))).thenReturn(activeRecord);
        when(bookRepository.save(any(Book.class))).thenReturn(book);

        BorrowRecord returned = bookService.returnBook(1L, 1L);

        assertNotNull(returned.getReturnDate());
        assertEquals(2, book.getAvailableCopies());
        verify(bookRepository, times(1)).save(book);
    }
}
