import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <header className="bg-white shadow-sm fixed w-full z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/src/images/ghuroo-logo.png"
              alt="Ghuroo Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#ffb600] to-[#63b1ec] bg-clip-text text-transparent">
              Ghuroo
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/destinations"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Destinations
            </Link>
            <Link
              to="/tours"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Tours
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/blogs"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Blogs
            </Link>
            {currentUser && (
              <Link
                to="/my-bookings"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Bookings
              </Link>
            )}
            {currentUser && (
              <Link
                to="/my-blogs"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Blogs
              </Link>
            )}

            {currentUser && (
              <Link
                to="/faq"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                FAQ
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <Link to="/profile" className="flex items-center space-x-2">
                <img
                  src={currentUser.profilePicture}
                  alt="profile"
                  className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                />
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
