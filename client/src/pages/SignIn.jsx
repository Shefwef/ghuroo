import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../components/OAuth";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase"; // ensure this is your firebase.js config

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
  
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
  
      // ✅ Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      console.log("idtoken ", idToken)
  
      // ✅ Send token to your backend
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }), // not formData!
      });
  
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data));
        return;
      }
  
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      dispatch(signInFailure(error));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
     

      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sign-in Form Section */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center">
          <div className="p-8 max-w-md w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <h1 className="text-3xl text-center font-semibold mb-7 text-gray-800">
              Sign In
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                id="email"
                className="bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                onChange={handleChange}
              />
              <input
                type="password"
                placeholder="Password"
                id="password"
                className="bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                onChange={handleChange}
              />
              <button
                disabled={loading}
                className="bg-blue-500 text-white p-3 rounded-lg uppercase hover:bg-blue-600 disabled:opacity-80"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>
              <OAuth />
            </form>
            <div className="flex items-center justify-center mt-5">
              <p className="text-gray-600 font-semibold">
                Don't have an account?
              </p>
              <Link to="/sign-up">
                <span className="text-blue-500 font-bold text-lg ml-1 hover:underline">
                  Sign Up
                </span>
              </Link>
            </div>
            <p className="text-red-600 mt-5">
              {error ? error.message || "Something went wrong!" : ""}
            </p>
          </div>
        </div>

        
      </div>
    </div>
  );
}
