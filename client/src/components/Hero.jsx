import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3"
          alt="Travel Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Explore breathtaking destinations, create unforgettable memories,
            and experience the world like never before.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-2 flex items-center max-w-2xl">
            <input
              type="text"
              placeholder="Where do you want to go?"
              className="flex-1 px-4 py-3 text-gray-700 focus:outline-none"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>

          {/* Popular Destinations */}
          <div className="mt-12 flex space-x-4">
            <Link
              to="/destinations/beach"
              className="text-white hover:text-blue-300 transition-colors"
            >
              #Beach
            </Link>
            <Link
              to="/destinations/mountain"
              className="text-white hover:text-blue-300 transition-colors"
            >
              #Mountain
            </Link>
            <Link
              to="/destinations/city"
              className="text-white hover:text-blue-300 transition-colors"
            >
              #City
            </Link>
            <Link
              to="/destinations/culture"
              className="text-white hover:text-blue-300 transition-colors"
            >
              #Culture
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
