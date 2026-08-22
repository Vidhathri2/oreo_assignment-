package com.assignment.bookmanagement.service;

import com.assignment.bookmanagement.exception.BadRequestException;
import com.assignment.bookmanagement.exception.ResourceNotFoundException;
import com.assignment.bookmanagement.model.Book;
import com.assignment.bookmanagement.model.BorrowRecord;
import com.assignment.bookmanagement.model.Borrower;
import com.assignment.bookmanagement.repository.BookRepository;
import com.assignment.bookmanagement.repository.BorrowRecordRepository;
import com.assignment.bookmanagement.repository.BorrowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BorrowerRepository borrowerRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    @Transactional
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, Book bookDetails) {
        Book book = getBookById(id);
        book.setTitle(bookDetails.getTitle());
        book.setIsbn(bookDetails.getIsbn());
        book.setAvailableCopies(bookDetails.getAvailableCopies());
        book.setTotalCopies(bookDetails.getTotalCopies());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        return bookRepository.save(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }

    public List<Book> searchBooks(String query) {
        return bookRepository.findByTitleContainingIgnoreCaseOrIsbnContainingIgnoreCase(query, query);
    }

    @Transactional
    public BorrowRecord borrowBook(Long bookId, Long borrowerId) {
        Book book = getBookById(bookId);

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Book is not available for borrowing. Available copies: 0");
        }

        Borrower borrower = borrowerRepository.findById(borrowerId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrower not found with id: " + borrowerId));

        if (borrowRecordRepository.findByBookIdAndBorrowerIdAndReturnDateIsNull(bookId, borrowerId).isPresent()) {
            throw new BadRequestException("Borrower has already borrowed this book and not returned it.");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord record = new BorrowRecord();
        record.setBook(book);
        record.setBorrower(borrower);
        record.setBorrowDate(LocalDate.now());

        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord returnBook(Long bookId, Long borrowerId) {
        Book book = getBookById(bookId);

        BorrowRecord record = borrowRecordRepository.findByBookIdAndBorrowerIdAndReturnDateIsNull(bookId, borrowerId)
                .orElseThrow(() -> new BadRequestException("No active borrow record found for this book and borrower."));

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        record.setReturnDate(LocalDate.now());
        return borrowRecordRepository.save(record);
    }
}
