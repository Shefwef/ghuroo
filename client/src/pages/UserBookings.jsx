import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function UserBookings() {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?._id) return;
    fetch(`/api/bookings/user/${currentUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.data || []);
        setLoading(false);
      });
  }, [currentUser]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : bookings.length === 0 ? (
        <div>No bookings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Tour</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Persons</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="border px-2 py-1">{b.tour_id?.title}</td>
                  <td className="border px-2 py-1">{new Date(b.booking_date).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{b.number_of_persons}</td>
                  <td className="border px-2 py-1">${b.total_price}</td>
                  <td className="border px-2 py-1">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}