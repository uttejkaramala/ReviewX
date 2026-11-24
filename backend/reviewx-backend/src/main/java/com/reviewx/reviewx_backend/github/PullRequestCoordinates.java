package com.reviewx.reviewx_backend.github;

public record PullRequestCoordinates(
        String owner,
        String repo,
        int pullNumber
) {
    public String canonicalUrl() {
        return "https://github.com/" + owner + "/" + repo + "/pull/" + pullNumber;
    }
}