import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Map,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Eye,
  Star,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalTours: 23,
    totalBookings: 156,
    totalRevenue: 45600,
  });

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Dashboard</h1>
        <p className="text-[#64748B] text-sm">
          Welcome back! Here's what's happening with your tours today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-sm font-medium mb-1">
                Total Users
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-[#64748B]" />
            </div>
          </div>
        </div>

        {/* Total Tours */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-sm font-medium mb-1">
                Active Tours
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {stats.totalTours}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
              <Map className="h-6 w-6 text-[#64748B]" />
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-sm font-medium mb-1">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {stats.totalBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-[#64748B]" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] rounded-2xl shadow-[0_8px_24px_rgba(255,107,71,0.25)] p-6 hover:shadow-[0_12px_32px_rgba(255,107,71,0.35)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-1 opacity-90">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-white">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              Recent Activity
            </h3>
            <button className="text-[#FF6B47] text-sm font-medium hover:text-[#E5533A] transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFC] rounded-lg">
              <div className="w-8 h-8 bg-[#4A90E2] rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A]">
                  New user registered
                </p>
                <p className="text-xs text-[#64748B]">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFC] rounded-lg">
              <div className="w-8 h-8 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A]">
                  New booking created
                </p>
                <p className="text-xs text-[#64748B]">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#F8FAFC] rounded-lg">
              <div className="w-8 h-8 bg-[#9B59B6] rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A]">
                  Tour review added
                </p>
                <p className="text-xs text-[#64748B]">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-all duration-300 group">
              <div className="w-10 h-10 bg-[#FF6B47] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Map className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-[#0F172A]">Add Tour</p>
            </button>

            <button className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-all duration-300 group">
              <div className="w-10 h-10 bg-[#4A90E2] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-[#0F172A]">Manage Users</p>
            </button>

            <button className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-all duration-300 group">
              <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-[#0F172A]">
                View Bookings
              </p>
            </button>

            <button className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition-all duration-300 group">
              <div className="w-10 h-10 bg-[#9B59B6] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-[#0F172A]">Analytics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E8EEF7] overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              Recent Bookings
            </h3>
            <button className="text-[#FF6B47] text-sm font-medium hover:text-[#E5533A] transition-colors">
              View All
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    Mountain Adventure
                  </p>
                  <p className="text-xs text-[#64748B]">Booked by John Doe</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#0F172A]">$299</p>
                <p className="text-xs text-[#64748B]">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#4A90E2] to-[#5BA0F2] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    Beach Paradise
                  </p>
                  <p className="text-xs text-[#64748B]">Booked by Jane Smith</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#0F172A]">$199</p>
                <p className="text-xs text-[#64748B]">4 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
