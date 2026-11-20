package com.reviewx.reviewx_backend.exception;

import java.time.Instant;
import java.util.Map;

import lombok.Builder;
import lombok.Getter;

@Builder
public record ErrorResponse(
		Instant timestamp,
		int status,
        String error,
        String message,
        Map<String, String> fieldErrors
		) {

	public ErrorResponse(int status, String error, String message) {
        this(Instant.now(), status, error, message, Map.of());
    }
}
