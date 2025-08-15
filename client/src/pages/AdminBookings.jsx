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

  const clearFilters = () => {
    setFilters({ user: "", tour: "", status: "" });
  };

  const filtered = bookings.filter(
    (b) =>
      (!filters.user ||
        b.user_id?.full_name
          ?.toLowerCase()
          .includes(filters.user.toLowerCase())) &&
      (!filters.tour ||
        b.tour_id?.title?.toLowerCase().includes(filters.tour.toLowerCase())) &&
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📑 All Bookings</h1>

     
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            🔍 Filter Bookings
          </h2>
          {(filters.user || filters.tour || filters.status) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="user"
            value={filters.user}
            onChange={handleFilterChange}
            placeholder="Filter by user"
            className="w-full border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-400 transition"
          />
          <input
            name="tour"
            value={filters.tour}
            onChange={handleFilterChange}
            placeholder="Filter by tour"
            className="w-full border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-400 transition"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full border border-gray-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Tour</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Persons</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr
                  key={b._id}
                  className={`border-t hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    {b.user_id?.full_name || b.user_id?.email}
                  </td>
                  <td className="px-4 py-3">{b.tour_id?.title}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(b.booking_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.number_of_persons}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    ${b.total_price}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusUpdate(b._id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-lg font-medium shadow-sm border-0 cursor-pointer focus:ring-2 transition-all duration-200
    ${
      b.status === "confirmed"
        ? "bg-green-100 text-green-700 focus:ring-green-300 hover:bg-green-200"
        : ""
    }
    ${
      b.status === "pending"
        ? "bg-yellow-100 text-yellow-700 focus:ring-yellow-300 hover:bg-yellow-200"
        : ""
    }
    ${
      b.status === "cancelled"
        ? "bg-red-100 text-red-700 focus:ring-red-300 hover:bg-red-200"
        : ""
    }
  `}
                    >
                      <option
                        value="pending"
                        className="bg-white text-yellow-700"
                      >
                        Pending
                      </option>
                      <option
                        value="confirmed"
                        className="bg-white text-green-700"
                      >
                        Confirmed
                      </option>
                      <option
                        value="cancelled"
                        className="bg-white text-red-700"
                      >
                        Cancelled
                      </option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
