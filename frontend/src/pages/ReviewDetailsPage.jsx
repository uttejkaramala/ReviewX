import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getReviewById } from "../api/reviewApi";
import FindingCard from "../components/FindingCard";
import "./ReviewDetailsPage.css";

function ReviewDetailsPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fileFilter, setFileFilter] = useState("ALL");

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
      const targetKey = finding.filePath
        ? `${finding.filePath}:${finding.lineNumber}`
        : `line:${finding.lineNumber}`;
      const lineEl = document.querySelector(
        `[data-line-key="${CSS.escape(targetKey)}"]`,
      );
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  if (loading) {
    return (
      <div className="page-transition">
        <div className="page-header">
          <div className="skeleton skel-title" />
          <div className="skeleton skel-subtitle" />
        </div>
        <div className="skeleton skel-strip" />
        <div className="split-layout">
          <div className="skeleton skel-code-box" />
          <div>
            <div className="skeleton skel-finding-card" />
            <div className="skeleton skel-finding-card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-transition">
        <div className="alert-error">{error}</div>
        <Link to="/" className="btn btn-secondary">
          Back to New Review
        </Link>
      </div>
    );
  }

  const isGitHubPr = review.sourceType === "GITHUB_PR";
  const rawLines = (review.submittedCode || "").split(/\r?\n/);

  // Track active file header & line number for both snippets and formatted PR diffs
  const { parsedLines } = rawLines.reduce(
    (acc, raw, idx) => {
      if (!isGitHubPr) {
        const num = idx + 1;
        acc.parsedLines.push({
          displayText: raw,
          displayNum: num,
          sign: "",
          filePath: null,
          lineKey: `line:${num}`,
          kind: "normal",
        });
        return acc;
      }

      const fileHeaderMatch = raw.match(
        /^=== FILE:\s+(.+?)(?:\s+\(status:.*)?\s*===$/,
      );
      if (fileHeaderMatch) {
        acc.currentFile = fileHeaderMatch[1].trim();
        acc.parsedLines.push({
          displayText: raw,
          displayNum: "",
          sign: "",
          filePath: acc.currentFile,
          lineKey: null,
          kind: "file-header",
        });
        return acc;
      }

      const addedMatch = raw.match(/^\s*(\d+)\s+\+\s\|\s?(.*)$/);
      if (addedMatch) {
        const num = Number(addedMatch[1]);
        acc.parsedLines.push({
          displayText: addedMatch[2],
          displayNum: num,
          sign: "+",
          filePath: acc.currentFile,
          lineKey: acc.currentFile
            ? `${acc.currentFile}:${num}`
            : `line:${num}`,
          kind: "added",
        });
        return acc;
      }

      const contextMatch = raw.match(/^\s*(\d+)\s+\|\s?(.*)$/);
      if (contextMatch) {
        const num = Number(contextMatch[1]);
        acc.parsedLines.push({
          displayText: contextMatch[2],
          displayNum: num,
          sign: "",
          filePath: acc.currentFile,
          lineKey: acc.currentFile
            ? `${acc.currentFile}:${num}`
            : `line:${num}`,
          kind: "normal",
        });
        return acc;
      }

      const removedMatch = raw.match(/^\s*-\s\|\s?(.*)$/);
      if (removedMatch) {
        acc.parsedLines.push({
          displayText: removedMatch[1],
          displayNum: "",
          sign: "-",
          filePath: acc.currentFile,
          lineKey: null,
          kind: "removed",
        });
        return acc;
      }

      acc.parsedLines.push({
        displayText: raw,
        displayNum: "",
        sign: "",
        filePath: acc.currentFile,
        lineKey: null,
        kind: raw.startsWith("@@") ? "hunk" : "meta",
      });
      return acc;
    },
    { currentFile: null, parsedLines: [] },
  );

  const selectedFinding = review.findings.find(
    (f) => f.id === selectedFindingId,
  );
  const selectedLineKey = selectedFinding?.lineNumber
    ? selectedFinding.filePath
      ? `${selectedFinding.filePath}:${selectedFinding.lineNumber}`
      : `line:${selectedFinding.lineNumber}`
    : null;

  const openLineKeys = new Set(
    review.findings
      .filter((f) => f.status === "OPEN" && f.lineNumber)
      .map((f) =>
        f.filePath ? `${f.filePath}:${f.lineNumber}` : `line:${f.lineNumber}`,
      ),
  );

  const uniqueFiles = Array.from(
    new Set(review.findings.map((f) => f.filePath).filter(Boolean)),
  );

  const openCount = review.findings.filter((f) => f.status === "OPEN").length;
  const resolvedCount = review.findings.filter(
    (f) => f.status === "RESOLVED",
  ).length;
  const dismissedCount = review.findings.filter(
    (f) => f.status === "DISMISSED",
  ).length;

  const filteredFindings = review.findings.filter((f) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : f.status === statusFilter;
    const matchesFile = fileFilter === "ALL" ? true : f.filePath === fileFilter;
    return matchesStatus && matchesFile;
  });

  return (
    <div className="page-transition">
      <div className="page-header-row">
        <div className="page-header">
          {isGitHubPr && (
            <div className="pr-meta-row">
              <span className="badge badge-category">GitHub Pull Request</span>
              {review.prUrl && (
                <a
                  href={review.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pr-link"
                >
                  View on GitHub ↗
                </a>
              )}
            </div>
          )}
          <h1>
            {isGitHubPr && review.prTitle
              ? review.prTitle
              : `Review #${review.id}`}
          </h1>
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

        <div className="filter-controls">
          {uniqueFiles.length > 1 && (
            <select
              className="file-select"
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              aria-label="Filter findings by file"
            >
              <option value="ALL">All Files ({uniqueFiles.length})</option>
              {uniqueFiles.map((path) => (
                <option key={path} value={path}>
                  {path}
                </option>
              ))}
            </select>
          )}

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
      </div>

      <div className="split-layout">
        <div className="code-panel">
          <div className="code-panel-header">
            <span>
              {isGitHubPr ? "Pull Request Diff" : "Submitted Source Code"}
            </span>
            <span>{rawLines.length} lines</span>
          </div>

          <div className="code-viewer">
            {parsedLines.map((line, index) => {
              const isHighlighted =
                line.lineKey && selectedLineKey === line.lineKey;
              const hasOpenIssue =
                line.lineKey && openLineKeys.has(line.lineKey);

              return (
                <div
                  key={index}
                  data-line-key={line.lineKey || undefined}
                  className={[
                    "code-line",
                    line.kind === "file-header" ? "code-line-file-header" : "",
                    line.kind === "hunk" ? "code-line-hunk" : "",
                    line.kind === "added" ? "code-line-added" : "",
                    line.kind === "removed" ? "code-line-removed" : "",
                    hasOpenIssue ? "code-line-issue" : "",
                    isHighlighted ? "code-line-highlighted" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="line-number">{line.displayNum}</span>
                  {isGitHubPr && <span className="diff-sign">{line.sign}</span>}
                  <span className="line-content">
                    {line.displayText || " "}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          {filteredFindings.length === 0 ? (
            <div className="card state-box">
              No findings match the selected filters.
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
