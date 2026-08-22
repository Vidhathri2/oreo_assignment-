package com.assignment.bookmanagement.repository;

import com.assignment.bookmanagement.model.Borrower;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowerRepository extends JpaRepository<Borrower, Long> {
}
