package com.reviewx.reviewx_backend.exception;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
	
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
			ResourceNotFoundException e){
		
		
		ErrorResponse error = ErrorResponse.builder()
								.timestamp(Instant.now())	
								.status(HttpStatus.NOT_FOUND.value())
								.error(HttpStatus.NOT_FOUND.getReasonPhrase())
					            .message(e.getMessage())
								.build();
							
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleValidationException(
	        MethodArgumentNotValidException e) {

	    Map<String, String> fieldErrors = e.getBindingResult()
	            .getFieldErrors()
	            .stream()
	            .collect(Collectors.toMap(
	                    FieldError::getField,
	                    FieldError::getDefaultMessage
	            ));

	    ErrorResponse error = ErrorResponse.builder()
	            .timestamp(Instant.now())
	            .status(HttpStatus.BAD_REQUEST.value())
	            .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
	            .message("Validation failed")
	            .fieldErrors(fieldErrors)
	            .build();

	    return ResponseEntity.badRequest().body(error);
	}

	@ExceptionHandler(AiAnalysisException.class)
    public ResponseEntity<ErrorResponse> handleAiAnalysisException(AiAnalysisException ex) {
        log.error("AI code analysis failed", ex);
        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_GATEWAY.value(),
                "AI Service Unavailable",
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(body);
    }
}
