package com.reviewx.reviewx_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.reviewx.reviewx_backend.entity.CodeReview;

public interface CodeReviewRepository extends JpaRepository<CodeReview, Long> {

	List<CodeReview> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT DISTINCT r FROM CodeReview r
            LEFT JOIN FETCH r.findings f
            LEFT JOIN FETCH f.category
            LEFT JOIN FETCH f.severity
            WHERE r.id = :id
            """)
    Optional<CodeReview> findByIdWithDetails(@Param("id") Long id);
}
