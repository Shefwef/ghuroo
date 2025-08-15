import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
            alt="Travel Adventure"
            className="w-full h-full object-cover"
          />
       
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        
        <div className="relative z-10 text-center text-white px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 text-white">
              About Ghuroo
            </h1>
            <p className="text-2xl mb-8 text-white/95 max-w-3xl mx-auto leading-relaxed">
              Discover the world with passion, purpose, and unforgettable experiences
            </p>
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">5+</div>
                <div className="text-white/80">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">10K+</div>
                <div className="text-white/80">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">25+</div>
                <div className="text-white/80">Destinations</div>
              </div>
            </div>
          </div>
        </div>
        
    
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Where It All Began</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Ghuroo was born from a simple yet powerful dream: to make extraordinary travel experiences accessible to everyone. Founded in 2018 by a group of passionate travelers and adventure seekers, our journey began with a backpack and an unshakeable belief that travel has the power to transform lives.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  What started as a small local tour company in Bangladesh has grown into a trusted travel partner for thousands of adventurers worldwide. Our founders, having explored over 50 countries themselves, understood that the best travel experiences come from authentic connections, local insights, and carefully crafted itineraries.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, Ghuroo stands as a testament to our commitment to excellence, sustainability, and the belief that every journey should be more than just a trip – it should be a story worth telling for a lifetime.
                </p>
              </div>
              <div className="relative">
                <div className="bg-blue-600 rounded-xl p-8 text-white shadow-xl">
                  <h4 className="text-xl font-semibold mb-4">Our Mission</h4>
                  <p className="text-white/95 leading-relaxed">
                    "To inspire and enable people to explore the world responsibly, creating meaningful connections and unforgettable memories while preserving the beauty and culture of the destinations we visit."
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-6 text-gray-800 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">5+</div>
                    <div className="text-sm font-medium">Years of Excellence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision we make and every experience we create
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Sustainability */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Sustainability</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                We're committed to eco-friendly practices, supporting local communities, and preserving the natural beauty of our destinations for future generations.
              </p>
            </div>

         
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Social Responsibility</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                We actively support local communities, promote cultural exchange, and ensure our operations benefit the people and places we visit.
              </p>
            </div>

           
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Excellence</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                We strive for excellence in every detail, from our carefully curated itineraries to our exceptional customer service and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind every Ghuroo adventure
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
           
            <div className="text-center group">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-2xl font-bold">IR</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Imtiaz Risat</h3>
              <p className="text-blue-600 mb-3 font-medium">Founder & CEO</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Adventure enthusiast with 15+ years of travel experience across 50+ countries.
              </p>
            </div>

          
            <div className="text-center group">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-2xl font-bold">NN</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nafisa Nawal Moumita</h3>
              <p className="text-blue-600 mb-3 font-medium">Head of Operations</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Expert in sustainable tourism and community development initiatives.
              </p>
            </div>

           
            <div className="text-center group">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-2xl font-bold">AA</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ahmed Alfey Sani</h3>
              <p className="text-blue-600 mb-3 font-medium">Lead Tour Guide</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Certified guide with deep knowledge of local cultures and hidden gems.
              </p>
            </div>

          
            <div className="text-center group">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-2xl font-bold">SS</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Shefayat E Shams Adib</h3>
              <p className="text-blue-600 mb-3 font-medium">Customer Experience</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dedicated to ensuring every traveler has an exceptional experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Achievements</h2>
            <p className="text-xl text-white/95 max-w-3xl mx-auto">
              Milestones that reflect our commitment to excellence and growth
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10,000+</div>
              <div className="text-white/90 font-medium">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-white/90 font-medium">Successful Tours</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-white/90 font-medium">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <div className="text-white/90 font-medium">Average Rating</div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-4xl mx-auto border border-white/20">
              <h3 className="text-2xl font-semibold mb-6">Awards & Recognition</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-yellow-300 text-3xl mb-3">🏆</div>
                  <div className="font-semibold text-lg">Best Travel Company 2023</div>
                  <div className="text-white/80 text-sm">Bangladesh Tourism Awards</div>
                </div>
                <div>
                  <div className="text-yellow-300 text-3xl mb-3">🌱</div>
                  <div className="font-semibold text-lg">Sustainability Champion</div>
                  <div className="text-white/80 text-sm">Green Tourism Initiative</div>
                </div>
                <div>
                  <div className="text-yellow-300 text-3xl mb-3">⭐</div>
                  <div className="font-semibold text-lg">Excellence in Service</div>
                  <div className="text-white/80 text-sm">Customer Choice Awards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Ready to Start Your Adventure?</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of travelers who have discovered the world with Ghuroo. Let us help you create memories that will last a lifetime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/tours"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Explore Our Tours
              </Link>
              <Link
                to="/contact"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-lg"
              >
                Get in Touch
              </Link>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl text-blue-600 mb-3">📞</div>
                <h3 className="font-semibold text-gray-800 mb-2">24/7 Support</h3>
                <p className="text-gray-600">We're here to help anytime, anywhere</p>
              </div>
              <div className="text-center">
                <div className="text-4xl text-blue-600 mb-3">🛡️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Your safety is our top priority</p>
              </div>
              <div className="text-center">
                <div className="text-4xl text-blue-600 mb-3">💎</div>
                <h3 className="font-semibold text-gray-800 mb-2">Premium Experience</h3>
                <p className="text-gray-600">Quality service guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <footer className="bg-gray-800 text-white py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Ghuroo</h3>
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
                <li>Email: info@ghuroo.com</li>
                <li>Phone: +880 123 456 789</li>
                <li>Address: Dhaka, Bangladesh</li>
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
