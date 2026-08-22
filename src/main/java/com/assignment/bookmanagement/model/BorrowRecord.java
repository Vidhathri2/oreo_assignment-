package com.assignment.bookmanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "borrow_records")
public class BorrowRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne
    @JoinColumn(name = "borrower_id", nullable = false)
    private Borrower borrower;

    @Column(nullable = false)
    private LocalDate borrowDate;

    private LocalDate returnDate;
}
