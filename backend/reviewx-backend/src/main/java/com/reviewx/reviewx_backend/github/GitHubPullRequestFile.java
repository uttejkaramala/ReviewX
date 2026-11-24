package com.reviewx.reviewx_backend.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GitHubPullRequestFile(
        String filename,
        String status,
        int additions,
        int deletions,
        String patch
) {
}