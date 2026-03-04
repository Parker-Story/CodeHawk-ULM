package com.womm.backend.repository;

import com.womm.backend.entity.TestSuiteCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestSuiteCaseRepository extends JpaRepository<TestSuiteCase, Long> {
    @Query("SELECT c FROM TestSuiteCase c WHERE c.suite.id = :suiteId")
    List<TestSuiteCase> findBySuiteId(@Param("suiteId") Long suiteId);
}