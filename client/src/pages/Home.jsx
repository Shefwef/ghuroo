import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      {/* Featured Destinations */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Featured Destinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Bali, Indonesia",
                image:
                  "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
                description:
                  "Experience paradise with pristine beaches and rich culture",
              },
              {
                title: "Paris, France",
                image:
                  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
                description:
                  "Discover the city of love and its iconic landmarks",
              },
              {
                title: "Tokyo, Japan",
                image:
                  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
                description:
                  "Immerse yourself in the perfect blend of tradition and innovation",
              },
            ].map((destination, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-lg"
              >
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="absolute bottom-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {destination.title}
                    </h3>
                    <p className="text-gray-200 mb-4">
                      {destination.description}
                    </p>
                    <Link
                      to={`/destinations/${destination.title
                        .toLowerCase()
                        .replace(",", "")}`}
                      className="inline-block bg-white text-gray-800 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-blue-600 py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
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
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 md:px-8 bg-gray-100">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for exclusive travel deals and updates
          </p>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Wanderlust</h3>
              <p className="text-gray-400">Your journey begins with us</p>
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
            <p>&copy; 2024 Wanderlust. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
