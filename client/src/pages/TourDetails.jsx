// client/src/pages/TourDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState({
    fullName: "",
    phone: "",
    date: "",
    groupSize: 1,
  });
  const [totalPrice, setTotalPrice] = useState(0);

  // Review state
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    fetchTour();
  }, [id]);

  useEffect(() => {
    if (tour && bookingData.groupSize) {
      const basePrice = tour.price * bookingData.groupSize;
      const taxes = basePrice * 0.05; // 5% tax
      setTotalPrice(basePrice + taxes);
    }
  }, [tour, bookingData.groupSize]);

  useEffect(() => {
    if (tour) fetchRecentReviews();
  }, [tour]);

  const fetchTour = async () => {
    try {
      const response = await fetch(`/api/tours/${id}`);
      const data = await response.json();

      if (data.success) {
        setTour(data.data);
      } else {
        setError("Tour not found");
      }
    } catch (err) {
      setError("Error loading tour details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentReviews = async () => {
    const url = showAllReviews
      ? `/api/reviews/tour/${tour._id}`
      : `/api/reviews/tour/${tour._id}/recent`;
    const res = await fetch(url);
    const data = await res.json();
    setReviews(data.data || []);
  };

  useEffect(() => {
    if (tour) fetchRecentReviews();
    // eslint-disable-next-line
  }, [showAllReviews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "groupSize" ? parseInt(value) || 1 : value,
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      console.log("You need to log in first");
      navigate("/signin");
      return;
    }

    try {
      const bookingPayload = {
        user_id: currentUser._id, // Use _id from MongoDB
        tour_id: tour._id,
        booking_date: bookingData.date,
        total_price: totalPrice,
        number_of_persons: bookingData.groupSize,
        status: "pending",
      };

      console.log("Sending booking payload:", bookingPayload);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();
      console.log("Booking response:", data);

      if (data.success) {
        alert("Booking submitted successfully! You will receive a confirmation email shortly.");
      } else {
        alert("Booking failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error submitting booking. Please try again.");
    }
  };

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    if (!currentUser) {
      setReviewError("You must be signed in to leave a review.");
      return;
    }
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewError("Rating must be between 1 and 5.");
      return;
    }
    try {
      const payload = {
        user_id: currentUser._id,
        tour_id: tour._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      };
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess("Review submitted!");
        setReviewForm({ rating: 5, comment: "" });
        fetchRecentReviews();
      } else {
        setReviewError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("Error submitting review.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/tours")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tour Image */}
            <div className="relative mb-6">
              <img
                src={tour.thumbnail_url}
                alt={tour.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              {tour.is_featured && (
                <span className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 text-sm font-semibold rounded">
                  Featured
                </span>
              )}
            </div>

            {/* Tour Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-600">
                  <span className="text-orange-500">📍</span>
                  <span className="ml-2">{tour.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 font-semibold">5.0</span>
                  <span className="text-gray-500 ml-1">(1)</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {tour.title}
              </h1>

              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {tour.description}
                </p>
              </div>

              {tour.itinerary && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-3">Itinerary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{tour.itinerary}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Duration</h4>
                  <p className="text-blue-600">{tour.duration_days} days</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Group Size</h4>
                  <p className="text-green-600">Up to 20 people</p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {tour.gallery_urls && tour.gallery_urls.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tour.gallery_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${tour.title} gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-3xl font-bold text-gray-800">
                    ${tour.price}
                  </span>
                  <span className="text-gray-500 ml-1">/Per Person</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 font-semibold">5.0</span>
                  <span className="text-gray-500 ml-1">(1)</span>
                </div>
              </div>

              <form onSubmit={handleBooking}>
                <h3 className="text-lg font-semibold mb-4">Information</h3>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={bookingData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        name="groupSize"
                        value={bookingData.groupSize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? "Person" : "People"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">
                      ${tour.price} × {bookingData.groupSize} Person
                      {bookingData.groupSize > 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold">
                      ${tour.price * bookingData.groupSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-semibold">
                      ${(tour.price * bookingData.groupSize * 0.05).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors"
                >
                  Book Now
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">Reviews</h3>
          <form onSubmit={handleReviewSubmit} className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <label className="font-medium">Your Rating:</label>
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
                className="border rounded px-2 py-1"
                required
              >
                {[1,2,3,4,5].map((star) => (
                  <option key={star} value={star}>{star} Star{star > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <textarea
              name="comment"
              value={reviewForm.comment}
              onChange={handleReviewChange}
              placeholder="Write your comment..."
              className="w-full border rounded px-3 py-2 mb-2"
              rows={3}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Review
            </button>
            {reviewError && <div className="text-red-600 mt-2">{reviewError}</div>}
            {reviewSuccess && <div className="text-green-600 mt-2">{reviewSuccess}</div>}
          </form>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-gray-500">No reviews yet.</div>
          ) : (
            <div>
              {reviews.map((r, idx) => (
                <div key={r._id || idx} className="border-b py-3 flex gap-3 items-start">
                  <img
                    src={r.user_id?.profilePicture || "/default-avatar.png"}
                    alt={r.user_id?.full_name || "User"}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.user_id?.full_name || "User"}</span>
                      <span className="text-yellow-500">
                        {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <div className="text-gray-700">{r.comment}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length >= 5 && !showAllReviews && (
                <button
                  className="mt-4 text-blue-600 hover:underline"
                  onClick={() => setShowAllReviews(true)}
                >
                  View All Reviews
                </button>
              )}
              {showAllReviews && (
                <button
                  className="mt-4 text-blue-600 hover:underline"
                  onClick={() => setShowAllReviews(false)}
                >
                  Show Less
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
