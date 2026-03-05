package com.womm.backend.repository;

import com.womm.backend.entity.RubricItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RubricItemRepository extends JpaRepository<RubricItem, Long> {
    @Query("SELECT i FROM RubricItem i WHERE i.criteria.id = :criteriaId ORDER BY i.displayOrder ASC")
    List<RubricItem> findByCriteriaId(@Param("criteriaId") Long criteriaId);
}