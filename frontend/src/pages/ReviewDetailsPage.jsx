import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getReviewById } from "../api/reviewApi";
import FindingCard from "../components/FindingCard";

function ReviewDetailsPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReviewById(id);
        setReview(data);
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

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1>Review #{review.id}</h1>
          <p>{review.summary}</p>
        </div>
        <Link to="/" className="btn btn-primary">
          + New Review
        </Link>
      </div>

      <div className="card">
        <strong style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Submitted Source Code
        </strong>
        <pre className="code-block">{review.submittedCode}</pre>
      </div>

      <h2 style={{ fontSize: "1.25rem", margin: "1.5rem 0 1rem" }}>
        Findings ({review.findings.length})
      </h2>

      {review.findings.length === 0 ? (
        <div className="card state-box">No issues found in this review.</div>
      ) : (
        review.findings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            onStatusUpdated={handleFindingUpdated}
          />
        ))
      )}
    </div>
  );
}

export default ReviewDetailsPage;
