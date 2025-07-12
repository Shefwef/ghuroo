import { useState, useEffect } from "react";

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading tours data
    setTimeout(() => {
      setTours([
        {
          id: 1,
          title: "Mountain Adventure",
          price: 299,
          duration: "3 days",
          status: "active",
        },
        {
          id: 2,
          title: "Beach Paradise",
          price: 199,
          duration: "2 days",
          status: "active",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B47]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Manage Tours</h1>
        <p className="text-[#64748B] text-sm">
          Create, edit, and manage your tour offerings
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F172A]">All Tours</h2>
            <button className="bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] hover:from-[#E5533A] hover:to-[#FF6B47] text-white px-6 py-3 rounded-lg font-semibold shadow-[0_4px_16px_rgba(255,107,71,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,71,0.4)] hover:-translate-y-0.5 transition-all duration-300">
              Add New Tour
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F1F5F9]">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F1F5F9]">
              {tours.map((tour) => (
                <tr
                  key={tour.id}
                  className="hover:bg-[#F8FAFC] transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#0F172A]">
                      {tour.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#0F172A]">
                      ${tour.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#64748B]">
                      {tour.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]">
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#FF6B47] hover:text-[#E5533A] font-medium transition-colors duration-200 mr-4">
                      Edit
                    </button>
                    <button className="text-[#64748B] hover:text-[#0F172A] font-medium transition-colors duration-200">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
