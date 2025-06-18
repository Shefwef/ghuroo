import React from "react";
import { Link } from "react-router-dom"
import Hero from "../components/Hero";

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-between px-4 md:px-8">
         
      {/* Main Content */}
      <div className="flex flex-col items-center mt-4">
       <Hero/>

        
        {/* Features Section */}
        
<div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
  <Link
    to="/track-mood"
    className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <h3 className="text-xl font-semibold text-blue-500">Track Mood</h3>
    <p className="text-gray-600 mt-2">
      A chatbot interface to record your current mood and offer mindfulness exercises.
    </p>
  </Link>

  <Link
    to="/get-health-tips"
    className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <h3 className="text-xl font-semibold text-green-500">Get Health Tips</h3>
    <p className="text-gray-600 mt-2">
      Receive personalized health tips based on your preferences and lifestyle.
    </p>
  </Link>

  <Link
    to="/view-progress"
    className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <h3 className="text-xl font-semibold text-purple-500">View Progress</h3>
    <p className="text-gray-600 mt-2">
      Monitor your progress with detailed insights and analytics.
    </p>
  </Link>
</div>;

      </div>

      {/* Footer */}
      <footer className="w-full text-center py-6 bg-gray-100 mt-10">
        <p className="text-gray-600">&copy; 2024 YourApp. All rights reserved.</p>
      </footer>
    </div>
  );
}
