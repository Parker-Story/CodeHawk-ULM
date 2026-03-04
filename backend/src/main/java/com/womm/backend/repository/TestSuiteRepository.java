package com.womm.backend.repository;

import com.womm.backend.entity.TestSuite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestSuiteRepository extends JpaRepository<TestSuite, Long> {
    @Query("SELECT s FROM TestSuite s WHERE s.createdBy.id = :userId")
    List<TestSuite> findByCreatedById(@Param("userId") String userId);
}