package com.assignment.bookmanagement;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiTest {
    @Autowired TestRestTemplate restTemplate;
    @Test
    void testReturnApi() {
        // Borrow book 1 by borrower 1
        ResponseEntity<String> res1 = restTemplate.postForEntity("/api/books/1/borrow?borrowerId=1", null, String.class);
        assertTrue(res1.getStatusCode().is2xxSuccessful(), "Borrow failed: " + res1.getBody());
        
        // Return book 1 by borrower 1
        ResponseEntity<String> res2 = restTemplate.postForEntity("/api/books/1/return?borrowerId=1", null, String.class);
        assertTrue(res2.getStatusCode().is2xxSuccessful(), "Return failed: " + res2.getBody());
        System.out.println("API TEST WORKED");
    }
}
