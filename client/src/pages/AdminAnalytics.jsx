import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#FF6B47", "#4ECDC4", "#4A90E2", "#FF8B73", "#9B59B6"];

export default function AdminAnalytics() {
  const [userStats, setUserStats] = useState([]);
  const [tourStats, setTourStats] = useState([]);
  const [bookingStats, setBookingStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch analytics data from your backend (implement endpoints as needed)
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [usersRes, toursRes, bookingsRes, revenueRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/tours"),
          fetch("/api/bookings"),
          fetch("/api/bookings/revenue"),
        ]);
        const users = await usersRes.json();
        const tours = await toursRes.json();
        const bookings = await bookingsRes.json();
        const revenue = await revenueRes.json();

        // Example: group bookings by status for PieChart
        const bookingStatusCounts = {};
        (bookings.data || []).forEach(b => {
          bookingStatusCounts[b.status] = (bookingStatusCounts[b.status] || 0) + 1;
        });
        setBookingStats(
          Object.entries(bookingStatusCounts).map(([status, count]) => ({
            name: status,
            value: count,
          }))
        );

        // Example: group tours by location for BarChart
        const tourLocationCounts = {};
        (tours.data || []).forEach(t => {
          tourLocationCounts[t.location] = (tourLocationCounts[t.location] || 0) + 1;
        });
        setTourStats(
          Object.entries(tourLocationCounts).map(([location, count]) => ({
            location,
            count,
          }))
        );

        // Example: users by role for PieChart
        const userRoleCounts = {};
        (users || []).forEach(u => {
          userRoleCounts[u.role] = (userRoleCounts[u.role] || 0) + 1;
        });
        setUserStats(
          Object.entries(userRoleCounts).map(([role, count]) => ({
            name: role,
            value: count,
          }))
        );

        // Example: revenue
        setRevenueStats([
          { name: "Total Revenue", value: revenue.totalRevenue || 0 },
        ]);
      } catch (err) {
        // Handle error
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users by Role */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {userStats.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bookingStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {bookingStats.map((entry, idx) => (
                  <Cell key={`cell-booking-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tours by Location */}
        <div className="bg-white rounded-xl shadow p-6 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Tours by Location</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tourStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FF6B47" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow p-6 col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Total Revenue</h2>
          <div className="text-3xl font-bold text-[#FF6B47]">
            ${revenueStats[0]?.value?.toLocaleString() || 0}
          </div>
        </div>
      </div>
    </div>
  );
}