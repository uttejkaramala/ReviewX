package com.reviewx.reviewx_backend.github;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class PullRequestDiffFormatter {
	private static final Pattern HUNK_HEADER_PATTERN =
            Pattern.compile("^@@ -\\d+(?:,\\d+)? \\+(\\d+)(?:,\\d+)? @@.*$");

    public String formatForAnalysis(PullRequestDetails prDetails) {
        StringBuilder out = new StringBuilder();
        out.append("PULL REQUEST: ").append(prDetails.title()).append('\n');
        out.append("URL: ").append(prDetails.canonicalUrl()).append("\n\n");

        List<GitHubPullRequestFile> files = prDetails.files();
        for (GitHubPullRequestFile file : files) {
            out.append("=== FILE: ").append(file.filename())
               .append(" (status: ").append(file.status())
               .append(", +").append(file.additions())
               .append("/-").append(file.deletions()).append(") ===\n");

            appendNumberedPatch(out, file.patch());
            out.append('\n');
        }

        return out.toString();
    }

    private void appendNumberedPatch(StringBuilder out, String patch) {
        if (patch == null || patch.isBlank()) {
            return;
        }

        int currentNewLine = 1;
        String[] lines = patch.split("\\R");

        for (String line : lines) {
            Matcher hunkMatcher = HUNK_HEADER_PATTERN.matcher(line);
            if (hunkMatcher.matches()) {
                currentNewLine = Integer.parseInt(hunkMatcher.group(1));
                out.append(line).append('\n');
                continue;
            }

            if (line.startsWith("-")) {
                // Deleted line does not exist in the new file version
                out.append("   - | ").append(line.substring(1)).append('\n');
            } else if (line.startsWith("+")) {
                out.append(String.format("%4d + | %s%n", currentNewLine, line.substring(1)));
                currentNewLine++;
            } else if (line.startsWith("\\")) {
                // "\ No newline at end of file"
                out.append(line).append('\n');
            } else {
                String content = line.startsWith(" ") ? line.substring(1) : line;
                out.append(String.format("%4d   | %s%n", currentNewLine, content));
                currentNewLine++;
            }
        }
    }
}
