import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";

export default function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    price: "",
    duration: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Check if we have search results from Home page
    if (location.state?.searchResults) {
      setTours(location.state.searchResults);
      setSearchQuery(location.state.searchQuery || "");
      setLoading(false);
    } else {
      fetchTours();
    }
  }, [location.state]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tours");
      const data = await response.json();
      console.log(data);

      if (data.success) {
        setTours(data.data);
      } else {
        setError("Failed to fetch tours");
      }
    } catch (err) {
      setError("Error loading tours");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/tours/search/${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.success) {
        setTours(data.data);
      } else {
        setError("Failed to search tours");
      }
    } catch (err) {
      setError("Error searching tours");
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = tours.filter((tour) => {
    if (
      filters.location &&
      !tour.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    if (filters.price) {
      const filterPrice = parseFloat(filters.price);
      if (isNaN(filterPrice) || tour.price > filterPrice) {
        return false;
      }
    }

    if (filters.duration) {
      const filterDuration = parseInt(filters.duration);
      if (isNaN(filterDuration) || tour.duration_days !== filterDuration) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setFilters({
      location: "",
      price: "",
      duration: "",
    });
    setSearchQuery("");
    fetchTours();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTours}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3")',
          }}
        ></div>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        <div className="container mx-auto px-6 h-full flex items-center relative z-10">
          <div className="text-center w-full">
            <h1 className="text-5xl font-bold text-white mb-4">All Tours</h1>
            <p className="text-xl text-blue-100">
              Discover amazing destinations around Bangladesh!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">🔍</span> Search Tours
              </label>
              <input
                type="text"
                placeholder="Search by title, location, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Filter Results
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">📍</span> Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Filter by location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">💰</span> Max Price ($)
              </label>
              <input
                type="number"
                name="price"
                placeholder="Maximum price"
                value={filters.price}
                onChange={handleFilterChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">📅</span> Duration (Days)
              </label>
              <input
                type="number"
                name="duration"
                placeholder="Number of days"
                value={filters.duration}
                onChange={handleFilterChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredTours.length} tour
            {filteredTours.length !== 1 ? "s" : ""}
            {searchQuery && (
              <span className="ml-2 text-blue-600 font-medium">
                for "{searchQuery}"
              </span>
            )}
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTours.map((tour) => (
            <div
              key={tour._id || tour.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={tour.thumbnail_url}
                  alt={tour.title}
                  className="w-full h-48 object-cover"
                  // onError={(e) => {
                  //   e.target.src = 'https://search.brave.com/images?q=grey+image';
                  // }}
                />
                {tour.is_featured && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 text-xs font-semibold rounded">
                    Featured
                  </span>
                )}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                  {tour.duration_days} days
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="text-orange-500">📍</span>
                  <span className="ml-1">{tour.location}</span>
                  <div className="ml-auto flex items-center">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1">4.5</span>
                    <span className="text-gray-400 ml-1">(13)</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {tour.title}
                </h3>

                {tour.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {tour.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-800">
                      ${tour.price}
                    </span>
                    <span className="text-sm text-gray-500">/Per Person</span>
                  </div>
                  <Link
                    to={`/tour/${tour._id || tour.id}`}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    See Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No tours found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No tours match your search for "${searchQuery}".`
                : "Try adjusting your filters or check back later for new tours."}
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
