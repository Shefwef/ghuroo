import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  

  return (
    <header className="pl-10 pr-10 bg-gray-200 text-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center py-3">
        <div className="flex items-center">
          <Link to="/home">
            <img src="#" width={180} height={100}/>
          </Link>
        </div>

        <nav className="hidden md:flex space-x-8">
          
          
          <Link
            to="/profile"
            className="flex items-center space-x-2 font-bold"
          >
            {currentUser ? (
              <img
                src={currentUser.profilePicture}
                alt="profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-green-700 hover:text-gray-400 transition duration-300">
                Sign In
              </span>
            )}
          </Link>
        </nav>

        <div className="md:hidden">
          <button className="text-gray-300 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
