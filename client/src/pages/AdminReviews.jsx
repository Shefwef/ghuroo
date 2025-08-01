import { useEffect, useState } from "react";

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

  const filteredReviews = reviews.filter((r) =>
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Reviews</h1>
      <div className="flex gap-4 mb-4">
        <select
          name="tour"
          value={filters.tour}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Tours</option>
          {tours.map((t) => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>
        <select
          name="rating"
          value={filters.rating}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Ratings</option>
          {[1,2,3,4,5].map((r) => (
            <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
          ))}
        </select>
        <select
          name="user"
          value={filters.user}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.full_name || u.email}</option>
          ))}
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
                <th className="border px-2 py-1">Rating</th>
                <th className="border px-2 py-1">Comment</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((r) => (
                <tr key={r._id}>
                  <td className="border px-2 py-1">{r.user_id?.full_name || r.user_id?.email}</td>
                  <td className="border px-2 py-1">{r.tour_id?.title}</td>
                  <td className="border px-2 py-1">{r.rating} ★</td>
                  <td className="border px-2 py-1">{r.comment}</td>
                  <td className="border px-2 py-1">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">No reviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}