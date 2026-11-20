import { useState } from "react";
import { updateFindingStatus } from "../api/reviewApi";

function FindingCard({ finding, onStatusUpdated }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusChange = async (newStatus) => {
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
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span className={`badge badge-${finding.severity}`}>
            {finding.severity}
          </span>
          <span className="badge badge-category">{finding.category}</span>
          {finding.lineNumber && (
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Line {finding.lineNumber}
            </span>
          )}
        </div>
        <span className={`badge badge-status-${finding.status}`}>
          {finding.status}
        </span>
      </div>

      <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
        {finding.title}
      </h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
        {finding.explanation}
      </p>

      {finding.suggestedFix && (
        <div style={{ marginBottom: "1rem" }}>
          <strong style={{ fontSize: "0.85rem", color: "#34d399" }}>
            Suggested Fix:
          </strong>
          <pre className="code-block">{finding.suggestedFix}</pre>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem" }}>
        {finding.status !== "RESOLVED" && (
          <button
            type="button"
            className="btn btn-sm btn-success"
            disabled={updating}
            onClick={() => handleStatusChange("RESOLVED")}
          >
            {updating ? "Updating..." : "Mark Resolved"}
          </button>
        )}

        {finding.status !== "DISMISSED" && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={updating}
            onClick={() => handleStatusChange("DISMISSED")}
          >
            Dismiss
          </button>
        )}

        {finding.status !== "OPEN" && (
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            disabled={updating}
            onClick={() => handleStatusChange("OPEN")}
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

export default FindingCard;
