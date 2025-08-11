import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ tour: "", rating: "", user: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchTours();
    fetchUsers();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data.data || []);
    setLoading(false);
  };

  const fetchTours = async () => {
    const res = await fetch("/api/tours");
    const data = await res.json();
    setTours(data.data || []);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data || []);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredReviews = reviews.filter(
    (r) =>
      (!filters.tour || r.tour_id?._id === filters.tour) &&
      (!filters.rating || String(r.rating) === filters.rating) &&
      (!filters.user || r.user_id?._id === filters.user)
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 All Reviews</h1>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            🔍 Filter Reviews
          </h2>
          {(filters.tour || filters.rating || filters.user) && (
            <button
              onClick={() => setFilters({ tour: "", rating: "", user: "" })}
              className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tour Filter */}
          <div>
            <label
              htmlFor="tour"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Tour
            </label>
            <select
              id="tour"
              name="tour"
              value={filters.tour}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-400 transition-all duration-150"
            >
              <option value="">All Tours</option>
              {tours.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-400 transition-all duration-150"
            >
              <option value="">All Ratings</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label
              htmlFor="user"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              User
            </label>
            <select
              id="user"
              name="user"
              value={filters.user}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-400 transition-all duration-150"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.full_name || u.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Tour</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-left">Comment</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {r.user_id?.full_name || r.user_id?.email}
                  </td>
                  <td className="px-4 py-3">{r.tour_id?.title}</td>
                  <td className="px-4 py-3 text-center font-semibold text-yellow-500">
                    {r.rating} ★
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.comment}</td>
                  <td className="px-4 py-3 text-center">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No reviews found.
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
