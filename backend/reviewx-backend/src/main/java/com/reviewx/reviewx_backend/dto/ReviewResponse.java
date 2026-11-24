package com.reviewx.reviewx_backend.dto;

import java.time.Instant;
import java.util.List;

import com.reviewx.reviewx_backend.enums.ReviewStatus;

public record ReviewResponse(
		Long id,
		String sourceType,
        String prUrl,
        String prTitle,
        String submittedCode,
        ReviewStatus status,
        String summary,
        int findingCount,
        List<FindingResponse> findings,
        Instant createdAt
		) {

}
