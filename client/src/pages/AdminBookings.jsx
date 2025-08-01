import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({ user: "", tour: "", status: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const res = await fetch("/api/bookings");
    const data = await res.json();
    setBookings(data.data || []);
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filtered = bookings.filter((b) =>
    (!filters.user || b.user_id?.full_name?.toLowerCase().includes(filters.user.toLowerCase())) &&
    (!filters.tour || b.tour_id?.title?.toLowerCase().includes(filters.tour.toLowerCase())) &&
    (!filters.status || b.status === filters.status)
  );

  const handleStatusUpdate = async (id, status) => {
    await fetch(`/api/bookings/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    fetchBookings();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>
      <div className="flex gap-4 mb-4">
        <input
          name="user"
          value={filters.user}
          onChange={handleFilterChange}
          placeholder="Filter by user"
          className="border px-2 py-1 rounded"
        />
        <input
          name="tour"
          value={filters.tour}
          onChange={handleFilterChange}
          placeholder="Filter by tour"
          className="border px-2 py-1 rounded"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-2 py-1">User</th>
                <th className="border px-2 py-1">Tour</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Persons</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td className="border px-2 py-1">{b.user_id?.full_name || b.user_id?.email}</td>
                  <td className="border px-2 py-1">{b.tour_id?.title}</td>
                  <td className="border px-2 py-1">{new Date(b.booking_date).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{b.number_of_persons}</td>
                  <td className="border px-2 py-1">${b.total_price}</td>
                  <td className="border px-2 py-1">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusUpdate(b._id, e.target.value)}
                      className="border rounded px-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}