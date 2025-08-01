import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function WriteBlog() {
  const { currentUser } = useSelector((state) => state.user);
  const [form, setForm] = useState({ title: "", content: "", is_featured: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  if (!currentUser) {
    navigate("/signin");
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title || !form.content) {
      setError("Title and content are required.");
      return;
    }
    const payload = {
      user_id: currentUser._id,
      title: form.title,
      content: form.content,
      is_featured: form.is_featured,
    };
    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Blog posted!");
      setTimeout(() => navigate("/blogs"), 1500);
    } else {
      setError(data.message || "Failed to post blog.");
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Write a Blog</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Blog Title"
          className="border p-3 rounded-lg"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Blog Content"
          className="border p-3 rounded-lg"
          rows={8}
          required
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
          />
          Featured Blog
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700"
        >
          Post Blog
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  );
}