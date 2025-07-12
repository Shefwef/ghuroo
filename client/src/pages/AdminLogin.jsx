import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken(true); // force refresh

      const response = await fetch("/api/admin/auth/admin/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response) {
        throw new Error("No response from server");
      }
      if (!response.ok) {
        const errorData = await response.text();
        try {
          const jsonData = JSON.parse(errorData);
          throw new Error(jsonData.message || "Admin authentication failed");
        } catch {
          throw new Error(errorData || "Admin authentication failed");
        }
      }
      const data = await response.json();
      if (data.success) {
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Admin authentication failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 border border-[#E8EEF7] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Admin Login
          </h1>
          <p className="text-[#64748B] text-sm">
            Sign in to your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#0F172A] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-0 focus:border-[#FF6B47] focus:shadow-[0_0_0_3px_rgba(255,107,71,0.1)] text-[#0F172A] bg-white placeholder-[#94A3B8] transition-all duration-300"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#0F172A] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-0 focus:border-[#FF6B47] focus:shadow-[0_0_0_3px_rgba(255,107,71,0.1)] text-[#0F172A] bg-white placeholder-[#94A3B8] transition-all duration-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-[#EF4444] text-sm text-center font-medium bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-[#FF6B47] to-[#FF8B73] hover:from-[#E5533A] hover:to-[#FF6B47] text-white font-semibold rounded-lg shadow-[0_4px_16px_rgba(255,107,71,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,71,0.4)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B47] focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
