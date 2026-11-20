package com.reviewx.reviewx_backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.reviewx.reviewx_backend.dto.CreateReviewRequest;
import com.reviewx.reviewx_backend.dto.FindingResponse;
import com.reviewx.reviewx_backend.dto.ReviewResponse;
import com.reviewx.reviewx_backend.enums.FindingStatus;
import com.reviewx.reviewx_backend.enums.ReviewStatus;
import com.reviewx.reviewx_backend.exception.ResourceNotFoundException;
import com.reviewx.reviewx_backend.service.ReviewService;

@WebMvcTest(ReviewController.class)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReviewService reviewService;

    @Test
    void createReview_ValidRequest_Returns201Created() throws Exception {
        ReviewResponse mockResponse = new ReviewResponse(
                1L,
                "public class Demo {}",
                ReviewStatus.COMPLETED,
                "Mock analysis completed: found 0 issues.",
                0,
                List.of(),
                Instant.now()
        );
        when(reviewService.submitCodeReview(any(CreateReviewRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "public class Demo {}"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void createReview_BlankCode_Returns400BadRequest() throws Exception {
        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.code").value("Source code must not be empty"));
    }

    @Test
    void getReviewById_NotFound_Returns404NotFound() throws Exception {
        when(reviewService.getReviewById(999L))
                .thenThrow(new ResourceNotFoundException("Code review not found with id: 999"));

        mockMvc.perform(get("/api/reviews/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Code review not found with id: 999"));
    }

    @Test
    void updateFindingStatus_ValidStatus_Returns200Ok() throws Exception {
        FindingResponse updated = new FindingResponse(
                1L,
                "Unsafe Optional.get()",
                "BUG",
                "Logic errors",
                "HIGH",
                2,
                "Explanation",
                "Fix",
                null,
                1,
                FindingStatus.RESOLVED,
                Instant.now()
        );
        when(reviewService.updateFindingStatus(1L, FindingStatus.RESOLVED)).thenReturn(updated);

        mockMvc.perform(patch("/api/findings/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "RESOLVED"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }
}