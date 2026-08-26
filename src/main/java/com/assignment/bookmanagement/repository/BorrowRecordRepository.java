package com.assignment.bookmanagement.repository;

import com.assignment.bookmanagement.model.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    
    // Find currently borrowed books
    List<BorrowRecord> findByReturnDateIsNull();
    
    // Check if a specific book is currently borrowed by a specific user
    Optional<BorrowRecord> findByBookIdAndBorrowerIdAndReturnDateIsNull(Long bookId, Long borrowerId);

    // Get recent transactions
    List<BorrowRecord> findTop10ByOrderByUpdatedAtDesc();
}
