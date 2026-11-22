import axiosClient from "./axiosClient";

// POST /api/reviews -> sends { code: "..." }, returns ReviewResponse
export const submitCodeReview = async (code) => {
  const response = await axiosClient.post("/reviews", { code });
  return response.data;
};

// GET /api/reviews?page=0&size=5 -> returns Spring Data Page<ReviewResponse>
export const getAllReviews = async (page = 0, size = 6) => {
  const response = await axiosClient.get("/reviews", {
    params: { page, size },
  });
  return response.data;
};

// GET /api/reviews/{id} -> returns ReviewResponse with findings
export const getReviewById = async (id) => {
  const response = await axiosClient.get(`/reviews/${id}`);
  return response.data;
};

// PATCH /api/findings/{id}/status -> sends { status: "RESOLVED" | "DISMISSED" }
export const updateFindingStatus = async (findingId, status) => {
  const response = await axiosClient.patch(`/findings/${findingId}/status`, {
    status,
  });
  return response.data;
};
