package com.reviewx.reviewx_backend.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.reviewx.reviewx_backend.enums.ReviewStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Setter;

@Entity
@Table(name = "code_reviews")
public class CodeReview {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Setter(AccessLevel.NONE)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;
	
	@Column(name = "submitted_code", nullable = false, columnDefinition = "TEXT")
	private String submittedCode;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private ReviewStatus status = ReviewStatus.COMPLETED;
	
	@Column(columnDefinition = "TEXT")
	private String summary;
	
	@Column(name = "created_at", nullable = false, updatable = false)
	@Setter(AccessLevel.NONE)
    private Instant createdAt;
	
	@OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true )
	private List<ReviewFinding> findings = new ArrayList<>();
	
	public CodeReview() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public void addFinding(ReviewFinding finding) {
        findings.add(finding);
        finding.setReview(this);
    }
	
}

