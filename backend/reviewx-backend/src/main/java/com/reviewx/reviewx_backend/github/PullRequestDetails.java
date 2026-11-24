package com.reviewx.reviewx_backend.github;

import java.util.List;

public record PullRequestDetails(
        String canonicalUrl,
        String title,
        String state,
        List<GitHubPullRequestFile> files
) {
}