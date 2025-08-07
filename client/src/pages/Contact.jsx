import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Message sent successfully!");
        toast.success("Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(data.message || "Failed to send message.");
        toast.error(data.message || "Failed to send message.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-200 to-blue-100 relative px-4">
      {/* Decorative blurred shapes */}
      <div className="absolute left-0 top-0 w-40 h-40 bg-orange-400 opacity-20 rounded-full blur-2xl -z-10 animate-pulse"></div>
      <div className="absolute right-0 bottom-0 w-56 h-56 bg-blue-200 opacity-20 rounded-full blur-2xl -z-10 animate-pulse"></div>
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 rounded-2xl shadow-2xl p-10 max-w-lg w-full space-y-8 border border-blue-200"
      >
        <h2 className="text-3xl font-extrabold text-blue-500 mb-2 text-center drop-shadow-lg">
          Contact Us
        </h2>
        <p className="text-blue-500 text-center mb-6">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you soon.
        </p>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full px-5 py-3 rounded-full border border-blue-300 focus:outline-none focus:border-blue-500 bg-white text-gray-700 text-base shadow"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full px-5 py-3 rounded-full border border-blue-300 focus:outline-none focus:border-blue-500 bg-white text-gray-700 text-base shadow"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Your Message"
          className="w-full px-5 py-3 rounded-xl border border-blue-300 focus:outline-none focus:border-blue-500 bg-white text-gray-700 text-base shadow resize-none"
          rows={5}
          required
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all text-lg w-full"
        >
          Send Message
        </button>
        {success && (
          <div className="text-green-600 text-center font-semibold">
            {success}
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center font-semibold">{error}</div>
        )}
      </form>
    </div>
  );
}
