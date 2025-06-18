import React from 'react';

export default function Hero() {
  return (
    <section className="hero bg-white py-16 mb-10">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Left Section - Text */}
        <div className="w-full sm:w-1/2 text-left ml-10">
          <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
            Welcome to MEDITALK
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            We provide high-quality medical services tailored to your health needs. Our platform connects you with top healthcare professionals who care about your well-being.
          </p>
          <p className="text-lg font-semibold text-gray-700">
            "Your Health, Our Priority."
          </p>
        </div>

        

        {/* Right Section - Image */}
        <div className="w-full sm:w-1/2">
          <img 
            src="/chatbot.png"  // Replace with your image link
            alt="Doctor" 
           // className="w-full h-auto rounded-lg shadow-lg"
           className='ml-20'
          />
        </div>
        
      </div>
    </section>
  );
}
