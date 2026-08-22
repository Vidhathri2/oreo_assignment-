package com.assignment.bookmanagement.controller;

import com.assignment.bookmanagement.model.Author;
import com.assignment.bookmanagement.model.Borrower;
import com.assignment.bookmanagement.model.Category;
import com.assignment.bookmanagement.repository.AuthorRepository;
import com.assignment.bookmanagement.repository.BorrowRecordRepository;
import com.assignment.bookmanagement.repository.BorrowerRepository;
import com.assignment.bookmanagement.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metadata")
@CrossOrigin(origins = "*")
public class MetadataController {

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BorrowerRepository borrowerRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @GetMapping("/authors")
    public List<Author> getAuthors() {
        return authorRepository.findAll();
    }

    @PostMapping("/authors")
    public ResponseEntity<Author> createAuthor(@RequestBody Author author) {
        return ResponseEntity.ok(authorRepository.save(author));
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @GetMapping("/borrowers")
    public List<Borrower> getBorrowers() {
        return borrowerRepository.findAll();
    }

    @PostMapping("/borrowers")
    public ResponseEntity<Borrower> createBorrower(@RequestBody Borrower borrower) {
        return ResponseEntity.ok(borrowerRepository.save(borrower));
    }

    @GetMapping("/transactions")
    public List<com.assignment.bookmanagement.model.BorrowRecord> getRecentTransactions() {
        return borrowRecordRepository.findTop10ByOrderByIdDesc();
    }
}
