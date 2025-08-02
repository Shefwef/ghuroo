import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function WriteBlog() {
  const { currentUser } = useSelector((state) => state.user);
  const [form, setForm] = useState({ title: "", content: "", is_featured: false });
  const [thumbnail, setThumbnail] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.title || !form.content) {
      setError("Title and content are required.");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('is_featured', form.is_featured);

      // Add thumbnail if selected
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      // Add gallery images if selected
      if (gallery.length > 0) {
        gallery.forEach((file) => {
          formData.append('gallery', file);
        });
      }

      const res = await fetch("/api/blogs", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Blog posted successfully!");
        setTimeout(() => navigate("/blogs"), 1500);
      } else {
        setError(data.message || "Failed to post blog.");
      }
    } catch (error) {
      setError("An error occurred while posting the blog.");
    } finally {
      setLoading(false);
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

        {/* Thumbnail Upload */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Thumbnail Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="border p-3 rounded-lg"
          />
          {thumbnail && (
            <div className="text-sm text-gray-600">
              Selected: {thumbnail.name}
            </div>
          )}
        </div>

        {/* Gallery Upload */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Gallery Images (Optional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
            className="border p-3 rounded-lg"
          />
          {gallery.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected: {gallery.length} image(s)
            </div>
          )}
        </div>

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
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Posting..." : "Post Blog"}
        </button>
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  );
}