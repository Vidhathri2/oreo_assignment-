package com.assignment.bookmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    @NotNull(message = "Available copies must be specified")
    @Min(value = 0, message = "Available copies cannot be negative")
    private Integer availableCopies;

    @NotNull(message = "Total copies must be specified")
    @Min(value = 0, message = "Total copies cannot be negative")
    private Integer totalCopies;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private Author author;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
