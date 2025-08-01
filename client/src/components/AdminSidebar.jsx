import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOut } from "../redux/user/userSlice";
import {
  Home,
  Map,
  CalendarDays,
  Users,
  UserCircle,
  LogIn,
  UserPlus,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async() => {
    try {
          await fetch('/api/auth/signout', {
            credentials: 'include'
          });
          dispatch(signOut());
          navigate('/admin/login');
        } catch (error) {
          console.log(error);
        }

  }

  return (
    <aside className="w-56 bg-white border-r border-[#F1F5F9] shadow-[0_0_20px_rgba(0,0,0,0.05)] flex flex-col justify-between fixed inset-y-0 left-0 z-40">
      <div>
        {/* Logo */}
        <div className="flex items-center h-20 px-6 border-b border-[#F1F5F9]">
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-[#0F172A]">
              Ghuroo Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex flex-col space-y-2 px-4">
          <Link
            to="/admin/dashboard"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              isActive("/admin/dashboard")
                ? "bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] text-white shadow-[0_4px_12px_rgba(255,107,71,0.2)]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            <Home
              className={`h-5 w-5 mr-3 ${
                isActive("/admin/dashboard") ? "text-white" : "text-[#64748B]"
              }`}
            />
            Dashboard
          </Link>

          <Link
            to="/admin/tours"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              isActive("/admin/tours")
                ? "bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] text-white shadow-[0_4px_12px_rgba(255,107,71,0.2)]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            <Map
              className={`h-5 w-5 mr-3 ${
                isActive("/admin/tours") ? "text-white" : "text-[#64748B]"
              }`}
            />
            Tours
          </Link>

          <Link
            to="/admin/bookings"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              isActive("/admin/bookings")
                ? "bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] text-white shadow-[0_4px_12px_rgba(255,107,71,0.2)]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            <CalendarDays
              className={`h-5 w-5 mr-3 ${
                isActive("/admin/bookings") ? "text-white" : "text-[#64748B]"
              }`}
            />
            Bookings
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              isActive("/admin/users")
                ? "bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] text-white shadow-[0_4px_12px_rgba(255,107,71,0.2)]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            <Users
              className={`h-5 w-5 mr-3 ${
                isActive("/admin/users") ? "text-white" : "text-[#64748B]"
              }`}
            />
            Users
          </Link>
          <Link
            to="/admin/analytics"
            className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
              isActive("/admin/analytics")
                ? "bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] text-white shadow-[0_4px_12px_rgba(255,107,71,0.2)]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`}
          >
            <TrendingUp
              className={`h-5 w-5 mr-3 ${
                isActive("/admin/analytics") ? "text-white" : "text-[#64748B]"
              }`}
            />
            Analytics
          </Link>
        </nav>
      </div>

      {/* Help Section */}
      <div className="px-4 py-6 border-t border-[#F1F5F9]">
        <Link
          to="/admin/profile"
          className="flex items-center px-4 py-3 rounded-lg font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all duration-300"
        >
          <UserCircle className="h-5 w-5 mr-3" />
          Profile
        </Link>
        <Link
          onClick={handleLogout}
          className="flex items-center px-4 py-3 rounded-lg font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all duration-300"
        >
          <LogIn className="h-5 w-5 mr-3" />
          Log out
        </Link>
      </div>
    </aside>
  );
}
