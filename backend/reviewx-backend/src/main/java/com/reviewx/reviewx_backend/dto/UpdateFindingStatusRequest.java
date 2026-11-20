package com.reviewx.reviewx_backend.dto;

import com.reviewx.reviewx_backend.enums.FindingStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateFindingStatusRequest(
		@NotNull(message = "Finding status is required")
		FindingStatus status) {

}
