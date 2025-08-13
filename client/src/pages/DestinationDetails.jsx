import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function DestinationDetails() {
  const { name } = useParams();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map of destination names to background images
  const destinationImages = {
    "Sajek Valley":
      "https://d2u0ktu8omkpf6.cloudfront.net/deab5d531957d73a0057d50d32f3babf269ef1c1fca30044.jpg",
    Bandarban:
      "https://images.unsplash.com/photo-1717418878623-50e09d80afcd?w=500&auto=format&fit=crop&q=60",
    Jaflong:
      "https://www.travelandexplorebd.com/storage/app/public/posts/April2020/41.jpg",
    "Cox's Bazar":
      "https://media-cdn.tripadvisor.com/media/photo-s/17/4c/44/75/laboni-beach.jpg",
    Srimangal:
      "https://pathfriend-bd.com/wp-content/uploads/2019/08/Tea-Capital-Sylhet-2.gif",
    Kuakata:
      "https://images.unsplash.com/photo-1710411592496-e9ee76b47806?q=80&w=1974&auto=format&fit=crop",
    "Saint Martin's Island":
      "https://www.tbsnews.net/sites/default/files/styles/infograph/public/images/2021/10/29/saint_martin_rashed_kabir.jpg",
    "Lawachara National Park":
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/Life_around_jungle.jpg",
    "Ratargul Swamp Forest":
      "https://www.travelmate.com.bd/wp-content/uploads/2019/07/Ratargul-2.jpg",
  };

  // Choose background image that matches the destination name, fallback to empty string if not found
  const backgroundImage = destinationImages[name] || "";

  useEffect(() => {
    fetchTours();
  }, [name]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/tours/location/${encodeURIComponent(name)}`
      );
      const data = await res.json();
      if (data.success) {
        setTours(data.data);
      }
    } catch (err) {
      console.error("Error fetching destination tours:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading tours...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background image with blur and overlay */}
      {backgroundImage && (
        <>
          <div
            className="fixed inset-0 bg-cover bg-center filter blur-md brightness-75 transition-all duration-500 z-0"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 bg-blue-900 bg-opacity-50 z-0"
            aria-hidden="true"
          />
        </>
      )}

      {/* Content on top */}
      <div className="relative z-10">
        {/* Hero */}
        <div className="relative h-64 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            {name} Tours
          </h1>
        </div>

        {/* Tours */}
        <div className="container mx-auto px-6 py-10">
          {tours.length === 0 ? (
            <p className="text-gray-600 text-center">
              No tours available for {name} at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <div
                  key={tour._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={tour.thumbnail_url}
                    alt={tour.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="text-orange-500">📍</span>
                      <span className="ml-1">{tour.location}</span>
                      <div className="ml-auto text-sm text-gray-400">
                        {tour.duration_days} days
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tour.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        ${tour.price}
                      </span>
                      <Link
                        to={`/tour/${tour._id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        See Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
