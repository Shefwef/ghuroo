import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
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
                <Link to="/contact" className="text-gray-400 hover:text-white">
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
                <Link to="/privacy" className="text-gray-400 hover:text-white">
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
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Travel St, City</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Ghuroo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
