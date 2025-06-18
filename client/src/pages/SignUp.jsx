import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      setLoading(false);
      if (data.success === false) {
        setError(true);
        return;
      }
      navigate("/sign-in");
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };
  return (
    <div className="flex flex-col md:flex-row h-screen">
      
      <div className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center">
        <div className="p-8 max-w-md w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 border border-slate-900 rounded-lg shadow-md">
          <h1 className="text-3xl text-center font-semibold mb-7 text-green-500">
            Sign Up
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              id="username"
              className="bg-green-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              id="email"
              className="bg-green-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              id="password"
              className="bg-green-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={handleChange}
            />
            <button
              disabled={loading}
              className="bg-green-700 text-white p-3 rounded-lg uppercase hover:bg-green-500 disabled:opacity-80"
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>
            <OAuth />
          </form>
          <div className="flex items-center justify-center mt-5">
            <p className="text-green-100 font-semibold">Have an account?</p>
            <Link to="/sign-in">
              <span className="text-blue-400 text-3xl font-bold text-lg ml-1 hover:text-green-400">
                Sign In
              </span>
            </Link>
          </div>
          <p className="text-red-700 mt-5">
            {error ? error.message || "Something went wrong!" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
