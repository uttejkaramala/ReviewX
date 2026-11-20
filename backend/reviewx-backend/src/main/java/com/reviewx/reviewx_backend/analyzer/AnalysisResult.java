package com.reviewx.reviewx_backend.analyzer;

import java.util.List;

public record AnalysisResult(
		String summary,
        List<AnalyzedFinding> findings
		) {
		
	public record AnalyzedFinding(
            String title,
            String categoryName,
            String severityName,
            String explanation,
            String suggestedFix,
            String filePath,
            Integer lineNumber
    ) {
}
}
