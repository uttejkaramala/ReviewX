import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getReviewById } from "../api/reviewApi";
import FindingCard from "../components/FindingCard";

function ReviewDetailsPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReviewById(id);
        setReview(data);
        if (data.findings.length > 0) {
          setSelectedFindingId(data.findings[0].id);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load code review details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleFindingUpdated = (updatedFinding) => {
    setReview((prev) => ({
      ...prev,
      findings: prev.findings.map((item) =>
        item.id === updatedFinding.id ? updatedFinding : item,
      ),
    }));
  };

  const handleSelectFinding = (finding) => {
    setSelectedFindingId(finding.id);
    if (finding.lineNumber) {
      const lineEl = document.getElementById(`code-line-${finding.lineNumber}`);
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  if (loading) {
    return <div className="state-box">Loading review results...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="alert-error">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to New Review
        </Link>
      </div>
    );
  }

  const codeLines = (review.submittedCode || "").split(/\r?\n/);
  const selectedFinding = review.findings.find(
    (f) => f.id === selectedFindingId,
  );
  const highlightedLine = selectedFinding?.lineNumber || null;

  const issueLineNumbers = new Set(
    review.findings
      .filter((f) => f.status === "OPEN" && f.lineNumber)
      .map((f) => f.lineNumber),
  );

  const openCount = review.findings.filter((f) => f.status === "OPEN").length;
  const resolvedCount = review.findings.filter(
    (f) => f.status === "RESOLVED",
  ).length;
  const dismissedCount = review.findings.filter(
    (f) => f.status === "DISMISSED",
  ).length;

  const filteredFindings = review.findings.filter((f) =>
    statusFilter === "ALL" ? true : f.status === statusFilter,
  );

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Review #{review.id}</h1>
          <p>{review.summary}</p>
        </div>
        <Link to="/" className="btn btn-primary">
          + New Review
        </Link>
      </div>

      <div className="summary-strip">
        <div className="stat-group">
          <span>
            Total: <strong>{review.findings.length}</strong>
          </span>
          <span>
            Open: <span className="text-danger-bold">{openCount}</span>
          </span>
          <span>
            Resolved: <span className="text-success-bold">{resolvedCount}</span>
          </span>
          <span>
            Dismissed: <strong>{dismissedCount}</strong>
          </span>
        </div>

        <div className="filter-pills">
          {["ALL", "OPEN", "RESOLVED", "DISMISSED"].map((status) => (
            <button
              key={status}
              type="button"
              className={`pill-btn ${statusFilter === status ? "active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === "ALL" ? "All Issues" : status}
            </button>
          ))}
        </div>
      </div>

      <div className="split-layout">
        <div className="code-panel">
          <div className="code-panel-header">
            <span>Submitted Source Code</span>
            <span>{codeLines.length} lines</span>
          </div>

          <div className="code-viewer">
            {codeLines.map((lineText, index) => {
              const lineNum = index + 1;
              const isHighlighted = highlightedLine === lineNum;
              const hasOpenIssue = issueLineNumbers.has(lineNum);

              return (
                <div
                  key={lineNum}
                  id={`code-line-${lineNum}`}
                  className={`code-line ${hasOpenIssue ? "code-line-issue" : ""} ${isHighlighted ? "code-line-highlighted" : ""}`}
                >
                  <span className="line-number">{lineNum}</span>
                  <span className="line-content">{lineText || " "}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {filteredFindings.length === 0 ? (
            <div className="card state-box">
              No findings match the selected filter.
            </div>
          ) : (
            filteredFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                isSelected={finding.id === selectedFindingId}
                onSelect={handleSelectFinding}
                onStatusUpdated={handleFindingUpdated}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewDetailsPage;
