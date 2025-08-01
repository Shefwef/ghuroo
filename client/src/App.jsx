import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import PrivateRoute from "./components/PrivateRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTours from "./pages/AdminTours";
import AdminBookings from "./pages/AdminBookings";
import AdminRoute from "./components/AdminRoute";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import AdminUsers from "./pages/AdminUsers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tours" element={<AdminTours />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* User Routes */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="tours" element={<Tours />} />
          <Route path="tour/:id" element={<TourDetails />} />
          <Route element={<PrivateRoute />}>
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
