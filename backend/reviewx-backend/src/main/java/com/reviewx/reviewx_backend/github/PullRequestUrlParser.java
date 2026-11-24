package com.reviewx.reviewx_backend.github;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class PullRequestUrlParser {

    private static final Pattern PR_URL_PATTERN = Pattern.compile(
            "^https?://(?:www\\.)?github\\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)/pull/(\\d+)(?:/.*)?$"
    );

    public PullRequestCoordinates parse(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalArgumentException("GitHub Pull Request URL must not be empty.");
        }

        Matcher matcher = PR_URL_PATTERN.matcher(rawUrl.trim());
        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                    "Invalid GitHub Pull Request URL. Expected format: https://github.com/{owner}/{repo}/pull/{number}"
            );
        }

        String owner = matcher.group(1);
        String repo = matcher.group(2);
        int pullNumber = Integer.parseInt(matcher.group(3));

        return new PullRequestCoordinates(owner, repo, pullNumber);
    }
}