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
      </div>
    </div>
  );
}
