package com.assignment.bookmanagement.controller;

import com.assignment.bookmanagement.model.Author;
import com.assignment.bookmanagement.model.Borrower;
import com.assignment.bookmanagement.model.Category;
import com.assignment.bookmanagement.repository.AuthorRepository;
import com.assignment.bookmanagement.repository.BorrowerRepository;
import com.assignment.bookmanagement.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @GetMapping("/authors")
    public List<Author> getAuthors() {
        return authorRepository.findAll();
    }

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/borrowers")
    public List<Borrower> getBorrowers() {
        return borrowerRepository.findAll();
    }
}
