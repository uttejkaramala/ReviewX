package com.reviewx.reviewx_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.reviewx.reviewx_backend.entity.ReviewFinding;

public interface ReviewFindingRepository extends JpaRepository<ReviewFinding, Long> {

	List<ReviewFinding> findByReviewIdOrderBySeverityPriorityOrderAsc(Long reviewId);
}
