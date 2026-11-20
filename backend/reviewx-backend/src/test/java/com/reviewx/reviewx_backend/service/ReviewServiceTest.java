package com.reviewx.reviewx_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.reviewx.reviewx_backend.analyzer.AnalysisResult;
import com.reviewx.reviewx_backend.analyzer.AnalysisResult.AnalyzedFinding;
import com.reviewx.reviewx_backend.analyzer.CodeAnalyzer;
import com.reviewx.reviewx_backend.dto.CreateReviewRequest;
import com.reviewx.reviewx_backend.dto.FindingResponse;
import com.reviewx.reviewx_backend.dto.ReviewResponse;
import com.reviewx.reviewx_backend.entity.CodeReview;
import com.reviewx.reviewx_backend.entity.FindingCategory;
import com.reviewx.reviewx_backend.entity.ReviewFinding;
import com.reviewx.reviewx_backend.entity.SeverityLevel;
import com.reviewx.reviewx_backend.enums.FindingStatus;
import com.reviewx.reviewx_backend.enums.ReviewStatus;
import com.reviewx.reviewx_backend.exception.ResourceNotFoundException;
import com.reviewx.reviewx_backend.repository.CodeReviewRepository;
import com.reviewx.reviewx_backend.repository.FindingCategoryRepository;
import com.reviewx.reviewx_backend.repository.ReviewFindingRepository;
import com.reviewx.reviewx_backend.repository.SeverityLevelRepository;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private CodeAnalyzer codeAnalyzer;

    @Mock
    private CodeReviewRepository codeReviewRepository;

    @Mock
    private ReviewFindingRepository reviewFindingRepository;

    @Mock
    private FindingCategoryRepository categoryRepository;

    @Mock
    private SeverityLevelRepository severityRepository;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void submitCodeReview_ValidCode_SavesAndReturnsResponse() {
        String sampleCode = "public void test() { optional.get(); }";
        CreateReviewRequest request = new CreateReviewRequest(sampleCode);

        AnalyzedFinding rawFinding = new AnalyzedFinding(
                "Unsafe Optional.get()",
                "BUG",
                "HIGH",
                "May throw NoSuchElementException",
                "Use orElseThrow()",
                null,
                1
        );
        when(codeAnalyzer.analyze(sampleCode))
                .thenReturn(new AnalysisResult("Found 1 issue.", List.of(rawFinding)));

        FindingCategory bugCategory = new FindingCategory();
        bugCategory.setName("BUG");
        bugCategory.setDescription("Logic errors");

        SeverityLevel highSeverity = new SeverityLevel();
        highSeverity.setName("HIGH");
        highSeverity.setPriorityOrder(2);

        when(categoryRepository.findByName("BUG")).thenReturn(Optional.of(bugCategory));
        when(severityRepository.findByName("HIGH")).thenReturn(Optional.of(highSeverity));
        when(codeReviewRepository.save(any(CodeReview.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponse response = reviewService.submitCodeReview(request);

        assertNotNull(response);
        assertEquals(ReviewStatus.COMPLETED, response.status());
        assertEquals(1, response.findingCount());
        assertEquals("Unsafe Optional.get()", response.findings().get(0).title());
        assertEquals("HIGH", response.findings().get(0).severity());
        verify(codeReviewRepository).save(any(CodeReview.class));
    }

    @Test
    void getReviewById_NonExistentId_ThrowsResourceNotFoundException() {
        when(codeReviewRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.getReviewById(99L));
    }

    @Test
    void updateFindingStatus_ValidFinding_UpdatesStatusToResolved() {
        FindingCategory category = new FindingCategory();
        category.setName("BUG");
        category.setDescription("Logic errors");

        SeverityLevel severity = new SeverityLevel();
        severity.setName("HIGH");
        severity.setPriorityOrder(2);

        ReviewFinding finding = new ReviewFinding();
        finding.setCategory(category);
        finding.setSeverity(severity);
        finding.setTitle("Sample bug");
        finding.setExplanation("Details");
        finding.setStatus(FindingStatus.OPEN);

        when(reviewFindingRepository.findById(1L)).thenReturn(Optional.of(finding));
        when(reviewFindingRepository.save(any(ReviewFinding.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FindingResponse updated = reviewService.updateFindingStatus(1L, FindingStatus.RESOLVED);

        assertEquals(FindingStatus.RESOLVED, updated.status());
    }
}