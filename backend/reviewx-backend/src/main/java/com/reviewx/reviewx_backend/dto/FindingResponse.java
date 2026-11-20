package com.reviewx.reviewx_backend.dto;

import java.time.Instant;

import com.reviewx.reviewx_backend.enums.FindingStatus;

public record FindingResponse(
		Long id,
        String title,
        String category,
        String categoryDescription,
        String severity,
        Integer severityPriority,
        String explanation,
        String suggestedFix,
        String filePath,
        Integer lineNumber,
        FindingStatus status,
        Instant createdAt
		) {

}
