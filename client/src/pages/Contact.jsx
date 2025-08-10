import React from "react";

export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left: Tourist destination image */}
        <div className="w-full h-[420px] md:h-auto">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" // Replace with your favorite destination image
            alt="Beautiful Tourist Destination"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Right: Contact form */}
        <div className="flex flex-col justify-center p-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            feel free to get in touch
          </h2>
          <p className="text-gray-600 mb-8">
            Have questions about our tours or need support? Fill out the form
            and our team will get back to you as soon as possible.
          </p>
          <form className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="flex-1 border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="flex-1 border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text"
              placeholder="Subject"
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <button
              type="submit"
              className="mt-2 w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-md shadow transition"
            >
              Submit Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
