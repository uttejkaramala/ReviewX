import { useState } from "react";
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

function SubmitReviewPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Please paste some Java source code before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdReview = await submitCodeReview(code);
      navigate(`/reviews/${createdReview.id}`);
    } catch (err) {
      const backendMessage =
        err.response?.data?.fieldErrors?.code ||
        err.response?.data?.message ||
        "Unable to connect to the ReviewX backend. Make sure Spring Boot is running on port 8080.";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
            disabled={loading}
          />

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Analyzing Code..." : "Analyze Code"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setCode(SAMPLE_JAVA_CODE);
                setError(null);
              }}
              disabled={loading}
            >
              Load Sample Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitReviewPage;
