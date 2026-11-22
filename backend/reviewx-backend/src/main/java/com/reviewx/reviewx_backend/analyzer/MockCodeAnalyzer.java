package com.reviewx.reviewx_backend.analyzer;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.reviewx.reviewx_backend.analyzer.AnalysisResult.AnalyzedFinding;

@Component
@ConditionalOnProperty(name = "reviewx.analyzer.provider", havingValue = "mock", matchIfMissing = true)
public class MockCodeAnalyzer implements CodeAnalyzer{

	@Override
    public AnalysisResult analyze(String sourceCode) {
        List<AnalyzedFinding> findings = new ArrayList<>();
        String[] lines = sourceCode.split("\\R");

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            int lineNumber = i + 1;

            if (line.contains(".get()")) {
                findings.add(new AnalyzedFinding(
                        "Unsafe Optional.get() access",
                        "BUG",
                        "HIGH",
                        "Calling Optional.get() without verifying presence throws NoSuchElementException at runtime if the value is empty.",
                        "Use .orElseThrow(() -> new EntityNotFoundException(\"Resource not found\")) or .orElse(...) instead.",
                        null,
                        lineNumber
                ));
            }

            if (line.matches(".*(password|secret|apiKey|token)\\s*=\\s*\".+\".*")) {
                findings.add(new AnalyzedFinding(
                        "Hardcoded sensitive credential detected",
                        "SECURITY",
                        "CRITICAL",
                        "Storing secrets or passwords directly in source code exposes credentials to anyone with repository access.",
                        "Load sensitive values from environment variables or Spring Boot externalized configuration (@Value).",
                        null,
                        lineNumber
                ));
            }

            if (line.contains("System.out.println")) {
                findings.add(new AnalyzedFinding(
                        "Console output used instead of structured logger",
                        "CODE_QUALITY",
                        "LOW",
                        "System.out.println writes synchronously to standard output without log levels, timestamps, or log rotation.",
                        "Inject an SLF4J Logger (LoggerFactory.getLogger(...)) and use log.info(...) or log.debug(...).",
                        null,
                        lineNumber
                ));
            }
        }

        if (findings.isEmpty()) {
            findings.add(new AnalyzedFinding(
                    "Add Javadoc and input null-checks for public methods",
                    "BEST_PRACTICE",
                    "INFO",
                    "No critical anti-patterns were detected by the mock analyzer, but public entry points benefit from explicit contract documentation and null validation.",
                    "Validate parameters with Objects.requireNonNull(...) or Jakarta Validation annotations.",
                    null,
                    1
            ));
        }

        String summary = "Mock analysis completed: found " + findings.size()
                + (findings.size() == 1 ? " issue." : " issues.");

        return new AnalysisResult(summary, findings);
    }
}
