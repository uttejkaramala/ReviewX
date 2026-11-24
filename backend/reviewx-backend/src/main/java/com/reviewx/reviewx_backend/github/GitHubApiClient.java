package com.reviewx.reviewx_backend.github;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.reviewx.reviewx_backend.exception.ResourceNotFoundException;

@Service
public class GitHubApiClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubApiClient.class);

    private static final Set<String> IGNORED_FILES = Set.of(
            "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "pom.xml.versionsBackup"
    );

    private final RestClient restClient;

    public GitHubApiClient(
            @Value("${reviewx.github.api-url:https://api.github.com}") String apiUrl,
            @Value("${reviewx.github.token:}") String githubToken) {

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .defaultHeader(HttpHeaders.USER_AGENT, "ReviewX-Code-Reviewer");

        if (githubToken != null && !githubToken.isBlank()) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken.trim());
        }

        this.restClient = builder.build();
    }

    public PullRequestDetails fetchPullRequest(PullRequestCoordinates coords) {
        GitHubPrMetadata metadata = restClient.get()
                .uri("/repos/{owner}/{repo}/pulls/{pullNumber}",
                        coords.owner(), coords.repo(), coords.pullNumber())
                .retrieve()
                .onStatus(status -> status.value() == 404, (req, res) -> {
                    throw new ResourceNotFoundException(
                            "GitHub Pull Request not found (or repository is private): " + coords.canonicalUrl());
                })
                .onStatus(HttpStatusCode::isError, (req, res) -> {
                    log.error("GitHub API error {} while fetching PR {}", res.getStatusCode(), coords.canonicalUrl());
                    throw new IllegalStateException(
                            "GitHub API returned HTTP " + res.getStatusCode().value() + ". Check rate limits or token.");
                })
                .body(GitHubPrMetadata.class);

        GitHubPullRequestFile[] rawFiles = restClient.get()
                .uri("/repos/{owner}/{repo}/pulls/{pullNumber}/files?per_page=30",
                        coords.owner(), coords.repo(), coords.pullNumber())
                .retrieve()
                .body(GitHubPullRequestFile[].class);

        List<GitHubPullRequestFile> reviewableFiles = rawFiles == null
                ? List.of()
                : Arrays.stream(rawFiles)
                        .filter(this::isReviewableSourceFile)
                        .toList();

        if (reviewableFiles.isEmpty()) {
            throw new IllegalArgumentException(
                    "No reviewable source code diffs found in Pull Request #" + coords.pullNumber());
        }

        String title = metadata != null ? metadata.title() : "Pull Request #" + coords.pullNumber();
        String state = metadata != null ? metadata.state() : "unknown";

        return new PullRequestDetails(coords.canonicalUrl(), title, state, reviewableFiles);
    }

    private boolean isReviewableSourceFile(GitHubPullRequestFile file) {
        if ("removed".equalsIgnoreCase(file.status())) {
            return false; // Skip deleted files
        }
        if (file.patch() == null || file.patch().isBlank()) {
            return false; // Skip binary files (images, jars, PDFs)
        }
        String name = file.filename();
        int slashIdx = name.lastIndexOf('/');
        String baseName = slashIdx >= 0 ? name.substring(slashIdx + 1) : name;
        return !IGNORED_FILES.contains(baseName);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GitHubPrMetadata(String title, String state) {
    }
}