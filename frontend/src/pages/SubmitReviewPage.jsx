import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitCodeReview } from "../api/reviewApi";
import "./SubmitReviewPage.css";

const SAMPLE_JAVA_CODE = `public class UserService {
    private static final String API_SECRET = "sk-live-secret-9981";

    public User getUserById(Long id) {
        System.out.println("Fetching user: " + id);
        return userRepository.findById(id).get();
    }
}`;

const ANALYSIS_STEPS = [
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

function SubmitReviewPage() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("IDLE"); // IDLE | ANALYZING | COMPLETE
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const isBusy = status === "ANALYZING" || status === "COMPLETE";

  useEffect(() => {
    if (status !== "ANALYZING") return;

    const interval = setInterval(() => {
      setStepIndex((prev) =>
        prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please paste some Java source code before submitting.");
      return;
    }

    setStatus("ANALYZING");
    setStepIndex(0);
    setError(null);

    try {
      const createdReview = await submitCodeReview(code);
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
          err.response?.data?.message ||
          "Unable to connect to the ReviewX backend. Make sure Spring Boot is running on port 8080.";
        setError(backendMessage);
      }
    }
  };

  const currentStep = ANALYSIS_STEPS[stepIndex];
  const lineCount = code ? code.split(/\r?\n/).length : 0;

  return (
    <div className="page-transition">
      <div className="page-header">
        <h1>Submit Java Code for Review</h1>
        <p>
          Paste a Java class or method below to detect bugs, security flaws, and
          quality issues.
        </p>
      </div>

      <div className="card">
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <textarea
            className="code-textarea"
            placeholder="Paste your Java source code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isBusy}
          />

          <div className="form-actions">
            <div className="form-buttons">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isBusy}
              >
                {status === "ANALYZING"
                  ? "Analyzing Code..."
                  : status === "COMPLETE"
                    ? "Opening Report..."
                    : "Analyze Code"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCode(SAMPLE_JAVA_CODE);
                  setError(null);
                }}
                disabled={isBusy}
              >
                Load Sample Code
              </button>
            </div>

            <span className="line-counter">
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </span>
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
