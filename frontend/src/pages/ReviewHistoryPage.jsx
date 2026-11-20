import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllReviews } from "../api/reviewApi";

function ReviewHistoryPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load review history.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <div className="state-box">Loading review history...</div>;
  }

  if (error) {
    return <div className="alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Review History</h1>
        <p>
          Browse all previously analyzed Java code submissions stored in
          PostgreSQL.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="card state-box">
          <p style={{ marginBottom: "1rem" }}>No code reviews submitted yet.</p>
          <Link to="/" className="btn btn-primary">
            Submit Your First Review
          </Link>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "center",
                  marginBottom: "0.35rem",
                }}
              >
                <strong>Review #{review.id}</strong>
                <span className="badge badge-category">
                  {review.findingCount}{" "}
                  {review.findingCount === 1 ? "finding" : "findings"}
                </span>
              </div>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}
              >
                {review.summary}
              </p>
              <small style={{ color: "var(--text-secondary)" }}>
                {new Date(review.createdAt).toLocaleString()}
              </small>
            </div>

            <Link
              to={`/reviews/${review.id}`}
              className="btn btn-secondary btn-sm"
            >
              View Details
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewHistoryPage;
