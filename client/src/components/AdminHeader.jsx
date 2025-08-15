import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "../redux/user/userSlice";
import NotificationDropdown from "./NotificationDropdown";

const formatStep = (step) => {
  return step.charAt(0).toUpperCase() + step.slice(1);
};

export default function AdminHeader() {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);
  const steps = pathnames.length ? pathnames.map(formatStep) : ["Home"];
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    try {
      const res = await fetch(
        `/api/notifications/admin/${currentUser._id}/unread`,
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

  const handleLogout = async() => {
    try {
          await fetch('/api/auth/signout', {
            credentials: 'include'
          });
          dispatch(signOut());
          navigate('/');
        } catch (error) {
          console.log(error);
        }

  }

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Breadcrumb */}
        <nav className="flex">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {steps.map((step, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg
                    className="w-3 h-3 mx-1 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                )}
                <span
                  className={`ml-1 text-sm font-medium ${
                    index === steps.length - 1
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        
        <div className="flex items-center space-x-4">
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          
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
            <NotificationDropdown
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
            />
          </div>

          
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {currentUser?.full_name || "Admin"}
              </span>
              <span className="text-xs text-gray-500">
                {currentUser?.email || "admin@example.com"}
              </span>
            </div>
            <img
              src={
                currentUser?.profilePicture || "https://via.placeholder.com/40"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
          </div>

          
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Site
          </button>
        </div>
      </div>
    </header>
  );
}
