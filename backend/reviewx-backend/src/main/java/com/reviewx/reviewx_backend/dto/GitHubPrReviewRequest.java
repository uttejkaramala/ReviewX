package com.reviewx.reviewx_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record GitHubPrReviewRequest(
		@NotBlank(message = "GitHub Pull Request URL must not be empty")
        String prUrl
        ) {

}
