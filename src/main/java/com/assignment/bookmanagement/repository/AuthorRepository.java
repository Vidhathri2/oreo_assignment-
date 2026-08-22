package com.assignment.bookmanagement.repository;

import com.assignment.bookmanagement.model.Author;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorRepository extends JpaRepository<Author, Long> {
}
