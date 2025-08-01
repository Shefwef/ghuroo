import { Link, useLocation , useNavigate } from "react-router-dom";
import { useSelector , useDispatch } from "react-redux";
import { Search, ExternalLink, Bell, User } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import { signOut } from "../redux/user/userSlice";

function formatStep(str) {
  if (!str) return "Home";
  return str.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminHeader() {
   const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);
  const steps = pathnames.length ? pathnames.map(formatStep) : ["Home"];
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <header className="h-20 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-b border-[#F1F5F9] flex items-center px-8 sticky top-0 z-30">
      {/* Breadcrumbs/Title */}
      <div className="flex-1 flex items-center">
        <Breadcrumb steps={steps} />
      </div>

      {/* Search and Profile */}
      <div className="flex items-center space-x-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:outline-none focus:ring-0 focus:border-[#FF6B47] focus:shadow-[0_0_0_3px_rgba(255,107,71,0.1)] bg-white text-sm text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 w-64"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#64748B]" />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-all duration-300 group">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B47] rounded-full border-2 border-white"></span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-[#0F172A]">
              {currentUser?.username || 'Admin'}
            </p>
            <p className="text-xs text-[#64748B]">
              {currentUser?.email}
            </p>
          </div>
        </div>

        {/* View Site Link */}
        <Link
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-lg transition-all duration-300 border border-[#E2E8F0] hover:border-[#CBD5E1] text-sm font-medium"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Site</span>
        </Link>
      </div>
    </header>
  );
}
