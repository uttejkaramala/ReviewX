package com.reviewx.reviewx_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.reviewx.reviewx_backend.dto.CreateReviewRequest;
import com.reviewx.reviewx_backend.dto.FindingResponse;
import com.reviewx.reviewx_backend.dto.ReviewResponse;
import com.reviewx.reviewx_backend.dto.UpdateFindingStatusRequest;
import com.reviewx.reviewx_backend.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ReviewController {

	private final ReviewService reviewService;
	
	public ReviewController(ReviewService reviewService) {
		this.reviewService = reviewService;
	}
	
	@PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse response = reviewService.submitCodeReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
	
	@GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
	
	@GetMapping("/reviews/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }
	
	@PatchMapping("/findings/{id}/status")
    public ResponseEntity<FindingResponse> updateFindingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFindingStatusRequest request) {
        FindingResponse updated = reviewService.updateFindingStatus(id, request.status());
        return ResponseEntity.ok(updated);
    }
	
}
