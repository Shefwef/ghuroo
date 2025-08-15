import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import UserNotificationDropdown from "./UserNotificationDropdown";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    if (!currentUser) return;

    try {
      const res = await fetch(
        `/api/notifications/user/${currentUser._id}/unread`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
  };

  return (
    <header className="bg-white shadow-sm fixed w-full z-50">
      <ToastContainer position="top-right" autoClose={3000} />
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
            <Link
              to="/about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>

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
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="p-1 rounded-full text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
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
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <UserNotificationDropdown
                    isOpen={notificationOpen}
                    onClose={() => setNotificationOpen(false)}
                  />
                </div>

                <Link to="/profile" className="flex items-center space-x-2">
                  <img
                    src={
                      currentUser.profilePicture ||
                      `https://ui-avatars.com/api/?name=${currentUser.username}&background=3b82f6&color=fff&size=40`
                    }
                    alt="profile"
                    className="h-10 w-10 rounded-full object-cover border-2 border-blue-500"
                  />
                </Link>
              </div>
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
