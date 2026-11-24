import { useState } from "react";
import { updateFindingStatus } from "../api/reviewApi";
import "./FindingCard.css";

function FindingCard({ finding, isSelected, onSelect, onStatusUpdated }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    setUpdating(true);
    setError(null);
    try {
      const updatedFinding = await updateFindingStatus(finding.id, newStatus);
      onStatusUpdated(updatedFinding);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update finding status.",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`card finding-card ${isSelected ? "finding-card-active" : ""}`}
      onClick={() => onSelect(finding)}
    >
      <div className="finding-card-header">
        <div className="finding-badges">
          <span className={`badge badge-${finding.severity}`}>
            {finding.severity}
          </span>
          <span className="badge badge-category">{finding.category}</span>
          {finding.filePath && (
            <span className="finding-file-tag" title={finding.filePath}>
              {finding.filePath}
            </span>
          )}
          {finding.lineNumber && (
            <span className="finding-line-tag">Line {finding.lineNumber}</span>
          )}
        </div>
        <span className={`badge badge-status-${finding.status}`}>
          {finding.status}
        </span>
      </div>

      <h3 className="finding-title">{finding.title}</h3>
      <p className="finding-explanation">{finding.explanation}</p>

      {finding.suggestedFix && (
        <div className="finding-fix-section">
          <span className="finding-fix-label">Suggested Fix</span>
          <pre className="code-block">{finding.suggestedFix}</pre>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      <div className="finding-actions">
        {finding.status !== "RESOLVED" && (
          <button
            type="button"
            className="btn btn-sm btn-success"
            disabled={updating}
            onClick={(e) => handleStatusChange(e, "RESOLVED")}
          >
            {updating ? "Updating..." : "Mark Resolved"}
          </button>
        )}

        {finding.status !== "DISMISSED" && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={updating}
            onClick={(e) => handleStatusChange(e, "DISMISSED")}
          >
            Dismiss
          </button>
        )}

        {finding.status !== "OPEN" && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={updating}
            onClick={(e) => handleStatusChange(e, "OPEN")}
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

export default FindingCard;
