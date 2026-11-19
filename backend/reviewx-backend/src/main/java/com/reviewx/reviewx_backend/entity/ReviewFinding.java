package com.reviewx.reviewx_backend.entity;

import java.time.Instant;

import com.reviewx.reviewx_backend.enums.FindingStatus;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "review_findings")
public class ReviewFinding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Setter(AccessLevel.NONE)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "review_id", nullable = false)
	private CodeReview review;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private FindingCategory category;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "severity_id", nullable = false)
	private SeverityLevel severity;
	
	@Column(length = 200, nullable = false)
	private String  title;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String explanation;
	
    @Column(name = "suggested_fix", columnDefinition = "TEXT")
    private String suggestedFix;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FindingStatus status = FindingStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Setter(AccessLevel.NONE)
    private Instant createdAt;
    
    public ReviewFinding() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }
}
