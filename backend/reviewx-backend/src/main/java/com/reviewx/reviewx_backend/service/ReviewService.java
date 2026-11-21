package com.reviewx.reviewx_backend.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
public class ReviewService {

	private final CodeAnalyzer codeAnalyzer;
    private final CodeReviewRepository codeReviewRepository;
    private final ReviewFindingRepository reviewFindingRepository;
    private final FindingCategoryRepository categoryRepository;
    private final SeverityLevelRepository severityRepository;

    public ReviewService(
            CodeAnalyzer codeAnalyzer,
            CodeReviewRepository codeReviewRepository,
            ReviewFindingRepository reviewFindingRepository,
            FindingCategoryRepository categoryRepository,
            SeverityLevelRepository severityRepository) {
        this.codeAnalyzer = codeAnalyzer;
        this.codeReviewRepository = codeReviewRepository;
        this.reviewFindingRepository = reviewFindingRepository;
        this.categoryRepository = categoryRepository;
        this.severityRepository = severityRepository;
    }
    
    @Transactional
    public ReviewResponse submitCodeReview(CreateReviewRequest request) {
        AnalysisResult result = codeAnalyzer.analyze(request.code());

        CodeReview review = new CodeReview();
        review.setSubmittedCode(request.code());
        review.setStatus(ReviewStatus.COMPLETED);
        review.setSummary(result.summary());

        for (AnalyzedFinding rawFinding : result.findings()) {
            FindingCategory category = resolveCategory(rawFinding.categoryName());
            SeverityLevel severity = resolveSeverity(rawFinding.severityName());

            ReviewFinding finding = new ReviewFinding();
            finding.setCategory(category);
            finding.setSeverity(severity);
            finding.setTitle(rawFinding.title());
            finding.setExplanation(rawFinding.explanation());
            finding.setSuggestedFix(rawFinding.suggestedFix());
            finding.setFilePath(rawFinding.filePath());
            finding.setLineNumber(rawFinding.lineNumber());
            finding.setStatus(FindingStatus.OPEN);

            review.addFinding(finding);
        }

        CodeReview savedReview = codeReviewRepository.save(review);
        return toReviewResponse(savedReview, true);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
    	return codeReviewRepository.findAll(pageable)
                .map(review -> toReviewResponse(review, false));
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {
        CodeReview review = codeReviewRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code review not found with id: " + id));
        return toReviewResponse(review, true);
    }

    @Transactional
    public FindingResponse updateFindingStatus(Long findingId, FindingStatus newStatus) {
        ReviewFinding finding = reviewFindingRepository.findById(findingId)
                .orElseThrow(() -> new ResourceNotFoundException("Review finding not found with id: " + findingId));

        finding.setStatus(newStatus);
        ReviewFinding updated = reviewFindingRepository.save(finding);
        return toFindingResponse(updated);
    }

    private FindingCategory resolveCategory(String categoryName) {
        String normalized = categoryName == null ? "CODE_QUALITY" : categoryName.trim().toUpperCase(Locale.ROOT);
        return categoryRepository.findByName(normalized)
                .or(() -> categoryRepository.findByName("CODE_QUALITY"))
                .orElseThrow(() -> new IllegalStateException("Reference category data missing in database"));
    }

    private SeverityLevel resolveSeverity(String severityName) {
        String normalized = severityName == null ? "MEDIUM" : severityName.trim().toUpperCase(Locale.ROOT);
        return severityRepository.findByName(normalized)
                .or(() -> severityRepository.findByName("MEDIUM"))
                .orElseThrow(() -> new IllegalStateException("Reference severity data missing in database"));
    }

    private ReviewResponse toReviewResponse(CodeReview review, boolean includeDetails) {
        List<FindingResponse> findingDtos = includeDetails
                ? review.getFindings().stream()
                        .sorted(Comparator.comparingInt(f -> f.getSeverity().getPriorityOrder()))
                        .map(this::toFindingResponse)
                        .toList()
                : List.of();

        int count = review.getFindings().size();

        return new ReviewResponse(
                review.getId(),
                includeDetails ? review.getSubmittedCode() : null,
                review.getStatus(),
                review.getSummary(),
                count,
                findingDtos,
                review.getCreatedAt()
        );
    }

    private FindingResponse toFindingResponse(ReviewFinding finding) {
        return new FindingResponse(
                finding.getId(),
                finding.getTitle(),
                finding.getCategory().getName(),
                finding.getCategory().getDescription(),
                finding.getSeverity().getName(),
                finding.getSeverity().getPriorityOrder(),
                finding.getExplanation(),
                finding.getSuggestedFix(),
                finding.getFilePath(),
                finding.getLineNumber(),
                finding.getStatus(),
                finding.getCreatedAt()
        );
    }
    
}
