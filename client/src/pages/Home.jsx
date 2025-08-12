import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import toast from "react-hot-toast";

export default function Home() {
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [featuredTours, setFeaturedTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTours();
  }, []);

  const fetchFeaturedTours = async () => {
    try {
      const response = await fetch("/api/tours/featured");
      const data = await response.json();

      if (data.success) {
        setFeaturedTours(data.data);
        toast.success("Featured tours loaded!");
      } else {
        toast.error(data.message || "Failed to load featured tours.");
      }
    } catch (error) {
      console.error("Error fetching featured tours:", error);
      toast.error("Error fetching featured tours.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setNewsletterSuccess(true);
    toast.success("Subscribed to newsletter!");
    setTimeout(() => setNewsletterSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Modern Hero Section */}
      <section className="relative min-h-[75vh] flex flex-col justify-center items-center text-center overflow-hidden bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1500&q=80"
          alt="Tropical beach with turquoise water"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
          style={{ objectPosition: "center" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4 animate-fade-in">
            Explore the World with <span className="text-blue-300">Ghuroo</span>
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 mb-8 animate-fade-in-slow">
            Handpicked destinations, seamless booking, and unforgettable
            experiences.
          </p>
          {/* Search Destination Section */}
          <form
            className="w-full max-w-xl flex bg-white/90 rounded-full shadow-lg overflow-hidden border border-blue-200"
            onSubmit={(e) => {
              e.preventDefault();
              const query = e.target.elements.destination.value.trim();
              if (query)
                window.location.href = `/destinations/${encodeURIComponent(
                  query.toLowerCase()
                )}`;
            }}
          >
            <input
              type="text"
              name="destination"
              className="flex-1 px-6 py-3 text-gray-700 text-base bg-transparent focus:outline-none"
              placeholder="Search your dream destination..."
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 transition-colors text-base"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">
            Featured Tours
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading featured tours...</div>
            </div>
          ) : featuredTours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured tours available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTours.slice(0, 3).map((tour) => (
                <div
                  key={tour._id}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <img
                    src={tour.thumbnail_url}
                    alt={tour.title}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                      {tour.title}
                    </h3>
                    <p
                      className="text-gray-200 mb-2 text-sm overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-semibold">
                        <span className="text-orange-300">${tour.price}</span>
                      </span>
                      <span className="text-gray-300 text-sm">
                        {tour.duration_days} days
                      </span>
                    </div>
                    <Link
                      to={`/tour/${tour._id}`}
                      className="inline-block bg-white/90 text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors shadow text-sm text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {featuredTours.length > 3 && (
            <div className="text-center mt-8">
              <Link
                to="/tours"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Tours
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-12 text-center">
            Popular Travel Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sajek Valley",
                img: "https://d2u0ktu8omkpf6.cloudfront.net/deab5d531957d73a0057d50d32f3babf269ef1c1fca30044.jpg",
                desc: "The unique beauty of Sajek Valley with green hills and clouds.",
              },
              {
                name: "Bandarban",
                img: "https://images.unsplash.com/photo-1717418878623-50e09d80afcd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fEJhbmRhcmJhbnxlbnwwfHwwfHx8MA%3D%3D",
                desc: "A land of hills, waterfalls, and indigenous culture.",
              },
              {
                name: "Jaflong",
                img: "https://www.travelandexplorebd.com/storage/app/public/posts/April2020/41.jpg",
                desc: "Rivers and serene hills make Jaflong stunning.",
              },
              {
                name: "Cox's Bazar",
                img: "https://media-cdn.tripadvisor.com/media/photo-s/17/4c/44/75/laboni-beach.jpg",
                desc: "The world's longest sea beach with crystal blue waters.",
              },
              {
                name: "Srimangal",
                img: "https://pathfriend-bd.com/wp-content/uploads/2019/08/Tea-Capital-Sylhet-2.gif",
                desc: "Tea gardens, seven-layer tea, and nature's peaceful beauty.",
              },
              {
                name: "Kuakata",
                img: "https://images.unsplash.com/photo-1710411592496-e9ee76b47806?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                desc: "A rare place to enjoy both sunrise and sunset over the sea.",
              },
            ].map((place, idx) => (
              <Link
                key={idx}
                to={`/destinations/${encodeURIComponent(place.name)}`}
              >
                <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <img
                    src={place.img}
                    alt={place.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {place.name}
                    </h3>
                    <p className="text-gray-200 text-sm">{place.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:bg-blue-200 hover:text-blue-700 transition-colors text-base"
            >
              View All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Travelers' Reviews */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-blue-100 to-blue-200">
        <div className="container mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-12 text-center">
            Travelers' Experiences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Mahmud Hasan",
                img: "https://randomuser.me/api/portraits/men/30.jpg",
                review:
                  "The cloud-covered hills of Sajek Valley touched my heart. An unforgettable trip.",
              },
              {
                name: "Sabiha Akter",
                img: "https://randomuser.me/api/portraits/women/40.jpg",
                review:
                  "Bandarban's waterfalls and peaceful surroundings amazed me. Highly recommended.",
              },
              {
                name: "Abdul Karim",
                img: "https://randomuser.me/api/portraits/men/12.jpg",
                review:
                  "The tea gardens and rivers of Sylhet are breathtaking. I can't wait to return.",
              },
            ].map((traveler, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={traveler.img}
                  alt={traveler.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-200"
                />
                <h3 className="text-lg font-bold text-blue-700 mb-2">
                  {traveler.name}
                </h3>
                <p className="text-gray-600 italic">"{traveler.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 py-12 px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ready for Your Next Adventure?
        </h2>
        <p className="text-blue-100 mb-6 text-lg">
          Explore the breathtaking destinations of Bangladesh today!
        </p>
        <Link
          to="/tours"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-2 rounded-full shadow-lg hover:bg-blue-700 hover:text-white transition-colors text-base"
        >
          View Tours
        </Link>
      </section>

      {/* Why Choose Us */}
      <section className="bg-blue-50 py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 mb-12 text-center">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: "✈️",
                title: "Best Deals",
                description: "Exclusive offers and competitive prices",
              },
              {
                icon: "🏆",
                title: "Expert Guides",
                description: "Professional and experienced tour guides",
              },
              {
                icon: "🔒",
                title: "Safe Travel",
                description: "24/7 support and secure bookings",
              },
              {
                icon: "⭐",
                title: "Top Rated",
                description: "Trusted by thousands of travelers",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl mb-4 animate-bounce">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-blue-100 to-blue-200">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">
            Stay Updated
          </h2>
          <p className="text-blue-600 mb-8">
            Subscribe to our newsletter for exclusive travel deals and updates
          </p>
          <form
            className="flex gap-4 justify-center"
            onSubmit={handleSubscribe}
          >
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2">
              Subscribe
            </button>
          </form>
          {newsletterSuccess && (
            <div className="mt-4 text-green-600 font-semibold animate-fade-in">
              Thank you for subscribing!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Wanderlust</h3>
              <p className="text-gray-400">Your journey begins with us</p>
              <div className="flex gap-4 mt-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.13 12.13 0 013 4.8a4.28 4.28 0 001.32 5.71c-.7-.02-1.36-.21-1.94-.53v.05a4.28 4.28 0 003.43 4.19c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.29 4.29 0 004 2.97A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.39-.02-.58A8.72 8.72 0 0024 4.59a8.48 8.48 0 01-2.54.7z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm6.25 1.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/tours" className="text-gray-400 hover:text-white">
                    Tours
                  </Link>
                </li>
                <li>
                  <Link
                    to="/destinations"
                    className="text-gray-400 hover:text-white"
                  >
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-400 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@wanderlust.com</li>
                <li>Phone: +1 234 567 890</li>
                <li>Address: 123 Travel St, City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ghuroo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
