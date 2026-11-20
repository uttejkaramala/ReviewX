import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReviewDetailsPage from "./pages/ReviewDetailsPage";
import ReviewHistoryPage from "./pages/ReviewHistoryPage";
import SubmitReviewPage from "./pages/SubmitReviewPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<SubmitReviewPage />} />
          <Route path="/reviews/:id" element={<ReviewDetailsPage />} />
          <Route path="/history" element={<ReviewHistoryPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
