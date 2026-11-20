package com.reviewx.reviewx_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateReviewRequest(
		@NotBlank(message = "Source code must not be empty") 
		@Size(max = 50000,
		message = "Source code cannot exceed 50,000 characters") 
		String code) {

}
