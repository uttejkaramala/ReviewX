package com.reviewx.reviewx_backend.analyzer;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.reviewx.reviewx_backend.exception.AiAnalysisException;

@Component
@ConditionalOnProperty(name = "reviewx.analyzer.provider", havingValue = "gemini")
public class GeminiCodeAnalyzer implements CodeAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(GeminiCodeAnalyzer.class);

    private static final String SYSTEM_PROMPT = """
            You are a Principal Java and Spring Boot Software Engineer performing a thorough code review.
            Analyze the provided line-numbered Java source code for real defects, vulnerabilities, and improvements.

            Rules for every finding you report:
            1. categoryName MUST be strictly one of:
               - BUG (logic errors, null pointer risks, incorrect exception handling, concurrency bugs)
               - SECURITY (SQL injection, hardcoded secrets, insecure deserialization, missing validation)
               - PERFORMANCE (N+1 queries, unnecessary object allocation, inefficient loops/streams, blocking calls)
               - CODE_QUALITY (high complexity, poor naming, duplicated logic, dead code, raw types)
               - BEST_PRACTICE (violating SOLID principles, missing immutability, improper Spring annotations)
            2. severityName MUST be strictly one of: CRITICAL, HIGH, MEDIUM, LOW, INFO.
            3. lineNumber MUST match the exact 1-based line number shown at the start of each line.
            4. explanation should clearly explain WHY the issue matters in production.
            5. suggestedFix should provide concise, idiomatic Java replacement code.
            6. filePath should be null for standalone code snippets.
            7. If the code is clean and has no issues, return an empty findings list and a positive summary.
            """;

    private final ChatClient chatClient;

    public GeminiCodeAnalyzer(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .build();
    }

    @Override
    public AnalysisResult analyze(String sourceCode) {
        String numberedCode = formatWithLineNumbers(sourceCode);

        try {
            AnalysisResult result = chatClient.prompt()
                    .user(u -> u.text("Review the following Java code:\n\n{code}")
                            .param("code", numberedCode))
                    .call()
                    .entity(AnalysisResult.class);

            if (result == null) {
                return new AnalysisResult("AI analysis completed with no findings.", List.of());
            }

            List<AnalysisResult.AnalyzedFinding> safeFindings =
                    result.findings() != null ? result.findings() : List.of();
            String safeSummary = (result.summary() != null && !result.summary().isBlank())
                    ? result.summary()
                    : "AI analysis completed: found " + safeFindings.size()
                            + (safeFindings.size() == 1 ? " issue." : " issues.");

            return new AnalysisResult(safeSummary, safeFindings);

        } catch (Exception ex) {
            log.error("Failed to analyze code with Gemini", ex);
            throw new AiAnalysisException(
                    "Google Gemini could not complete the code review. Verify your GEMINI_API_KEY and network connection.",
                    ex
            );
        }
    }

    private String formatWithLineNumbers(String sourceCode) {
        String[] lines = sourceCode.split("\\R");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            sb.append(i + 1).append(" | ").append(lines[i]).append('\n');
        }
        return sb.toString();
    }
}