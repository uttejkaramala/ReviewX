import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitCodeReview, submitGitHubPrReview } from "../api/reviewApi";
import "./SubmitReviewPage.css";

const SAMPLE_JAVA_CODE = `public class UserService {
    private static final String API_SECRET = "sk-live-secret-9981";

    public User getUserById(Long id) {
        System.out.println("Fetching user: " + id);
        return userRepository.findById(id).get();
    }
}`;

const SAMPLE_PR_URL =
  "https://github.com/spring-projects/spring-petclinic/pull/950";

const SNIPPET_STEPS = [
  {
    title: "Parsing code structure & line numbers...",
    subtitle: "Preparing source context for deep static inspection",
    progress: 22,
  },
  {
    title: "Scanning for bugs & null-safety risks...",
    subtitle: "Checking control flow, exceptions, and edge cases",
    progress: 48,
  },
  {
    title: "Auditing security & performance patterns...",
    subtitle: "Inspecting credentials, queries, and resource handling",
    progress: 74,
  },
  {
    title: "Generating line-level fixes & saving report...",
    subtitle: "Structuring actionable recommendations",
    progress: 90,
  },
];

const PR_STEPS = [
  {
    title: "Connecting to GitHub REST API...",
    subtitle: "Fetching Pull Request metadata and modified file diffs",
    progress: 24,
  },
  {
    title: "Mapping unified diff hunk line numbers...",
    subtitle: "Filtering lockfiles and aligning added (+) lines",
    progress: 50,
  },
  {
    title: "Running multi-file AI security & bug review...",
    subtitle: "Analyzing cross-file logic and regressions",
    progress: 78,
  },
  {
    title: "Saving Pull Request audit report...",
    subtitle: "Persisting findings mapped by file path and line",
    progress: 92,
  },
];

function SubmitReviewPage() {
  const [mode, setMode] = useState("SNIPPET"); // SNIPPET | GITHUB_PR
  const [code, setCode] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [status, setStatus] = useState("IDLE"); // IDLE | ANALYZING | COMPLETE
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isBusy = status === "ANALYZING" || status === "COMPLETE";
  const activeSteps = mode === "GITHUB_PR" ? PR_STEPS : SNIPPET_STEPS;

  useEffect(() => {
    if (status !== "ANALYZING") return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < activeSteps.length - 1 ? prev + 1 : prev));
    }, 2200);

    return () => clearInterval(interval);
  }, [status, activeSteps.length]);

  const handleModeSwitch = (nextMode) => {
    if (isBusy) return;
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "SNIPPET" && !code.trim()) {
      setError("Please paste some Java source code before submitting.");
      return;
    }

    if (mode === "GITHUB_PR" && !prUrl.trim()) {
      setError("Please enter a GitHub Pull Request URL.");
      return;
    }

    setStatus("ANALYZING");
    setStepIndex(0);

    try {
      const createdReview =
        mode === "GITHUB_PR"
          ? await submitGitHubPrReview(prUrl.trim())
          : await submitCodeReview(code);

      setStatus("COMPLETE");

      setTimeout(() => {
        navigate(`/reviews/${createdReview.id}`);
      }, 550);
    } catch (err) {
      setStatus("IDLE");
      if (err.code === "ECONNABORTED") {
        setError(
          "Analysis took longer than expected. Check Review History in a moment.",
        );
      } else {
        const backendMessage =
          err.response?.data?.fieldErrors?.code ||
          err.response?.data?.fieldErrors?.prUrl ||
          err.response?.data?.message ||
          "Unable to connect to the ReviewX backend. Make sure Spring Boot is running on port 8080.";
        setError(backendMessage);
      }
    }
  };

  const currentStep = activeSteps[stepIndex];
  const lineCount = code ? code.split(/\r?\n/).length : 0;

  return (
    <div className="page-transition">
      <div className="page-header">
        <h1>New AI Code Review</h1>
        <p>
          Analyze a standalone code snippet or audit an entire GitHub Pull
          Request automatically.
        </p>
      </div>

      <div className="card">
        <div className="mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "SNIPPET"}
            className={`mode-tab ${mode === "SNIPPET" ? "active" : ""}`}
            onClick={() => handleModeSwitch("SNIPPET")}
            disabled={isBusy}
          >
            Paste Code Snippet
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "GITHUB_PR"}
            className={`mode-tab ${mode === "GITHUB_PR" ? "active" : ""}`}
            onClick={() => handleModeSwitch("GITHUB_PR")}
            disabled={isBusy}
          >
            GitHub Pull Request
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === "SNIPPET" ? (
            <textarea
              className="code-textarea"
              placeholder="Paste your Java source code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isBusy}
            />
          ) : (
            <div className="pr-input-group">
              <label htmlFor="pr-url-input" className="input-label">
                Pull Request URL
              </label>
              <input
                id="pr-url-input"
                type="url"
                className="text-input"
                placeholder="https://github.com/owner/repository/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                disabled={isBusy}
              />
              <p className="input-hint">
                Works with any public GitHub repository Pull Request. Changed
                source diffs are fetched and mapped automatically.
              </p>
            </div>
          )}

          <div className="form-actions">
            <div className="form-buttons">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isBusy}
              >
                {status === "ANALYZING"
                  ? mode === "GITHUB_PR"
                    ? "Reviewing Pull Request..."
                    : "Analyzing Code..."
                  : status === "COMPLETE"
                    ? "Opening Report..."
                    : mode === "GITHUB_PR"
                      ? "Review Pull Request"
                      : "Analyze Code"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (mode === "GITHUB_PR") {
                    setPrUrl(SAMPLE_PR_URL);
                  } else {
                    setCode(SAMPLE_JAVA_CODE);
                  }
                  setError(null);
                }}
                disabled={isBusy}
              >
                {mode === "GITHUB_PR" ? "Load Sample PR" : "Load Sample Code"}
              </button>
            </div>

            {mode === "SNIPPET" && (
              <span className="line-counter">
                {lineCount} {lineCount === 1 ? "line" : "lines"}
              </span>
            )}
          </div>
        </form>

        {isBusy && (
          <div
            className={`ai-progress-panel ${status === "COMPLETE" ? "is-complete" : ""}`}
          >
            <div className="ai-progress-header">
              {status === "COMPLETE" ? (
                <span className="ai-check-badge">✓</span>
              ) : (
                <span className="ai-spinner" />
              )}

              <div>
                <div className="ai-stage-title">
                  {status === "COMPLETE"
                    ? "Analysis complete! Preparing split-screen report..."
                    : currentStep.title}
                </div>
                <div className="ai-stage-subtitle">
                  {status === "COMPLETE"
                    ? "Redirecting smoothly to your findings"
                    : currentStep.subtitle}
                </div>
              </div>
            </div>

            <div className="ai-progress-track">
              <div
                className="ai-progress-fill"
                style={{
                  width: `${status === "COMPLETE" ? 100 : currentStep.progress}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitReviewPage;
