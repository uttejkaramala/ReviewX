import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllReviews } from "../api/reviewApi";
import "./ReviewHistoryPage.css";

function ReviewHistoryPage() {
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllReviews(currentPage, PAGE_SIZE);
        setPageData(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load review history.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="page-transition">
        <div className="page-header-row">
          <div className="page-header">
            <h1>Review History</h1>
            <p>Fetching review records...</p>
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="skeleton skel-history-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-transition">
        <div className="alert-error">{error}</div>
      </div>
    );
  }

  const reviews = pageData?.content || [];
  const pageMeta = pageData?.page ?? pageData ?? {};
  const totalElements = pageMeta.totalElements ?? reviews.length;
  const totalPages = pageMeta.totalPages ?? 1;
  const isFirstPage = currentPage <= 0;
  const isLastPage = currentPage + 1 >= totalPages;

  return (
    <div className="page-transition">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Review History</h1>
          <p>
            {totalElements} total {totalElements === 1 ? "review" : "reviews"}{" "}
            stored in PostgreSQL.
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          + New Review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="card state-box">
          <p className="empty-state-text">No code reviews submitted yet.</p>
          <Link to="/" className="btn btn-primary">
            Submit Your First Review
          </Link>
        </div>
      ) : (
        <>
          {reviews.map((review) => (
            <div key={review.id} className="card history-card">
              <div>
                <div className="history-card-header">
                  <span className="history-id">Review #{review.id}</span>
                  <span
                    className={`badge ${review.findingCount > 0 ? "badge-status-OPEN" : "badge-status-RESOLVED"}`}
                  >
                    {review.findingCount}{" "}
                    {review.findingCount === 1 ? "finding" : "findings"}
                  </span>
                </div>
                <p className="history-summary">{review.summary}</p>
                <span className="history-date">
                  {new Date(review.createdAt).toLocaleString()}
                </span>
              </div>

              <Link
                to={`/reviews/${review.id}`}
                className="btn btn-secondary btn-sm"
              >
                Inspect Review
              </Link>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pagination-bar">
              <span className="pagination-info">
                Page <strong>{currentPage + 1}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={isFirstPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={isLastPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ReviewHistoryPage;
