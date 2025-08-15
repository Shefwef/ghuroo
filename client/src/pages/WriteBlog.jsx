import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function WriteBlog() {
  const { currentUser } = useSelector((state) => state.user);
  const [form, setForm] = useState({
    title: "",
    content: "",
    is_featured: false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    }
  }, [currentUser, navigate]);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGallery(files);

    // Create previews
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setGalleryPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.title || !form.content) {
      setError("Title and content are required.");
      setLoading(false);
      toast.error("Title and content are required.");
      return;
    }

    try {
      
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("is_featured", form.is_featured);

      
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      
      if (gallery.length > 0) {
        gallery.forEach((file) => {
          formData.append("gallery", file);
        });
      }

      const res = await fetch("/api/blogs", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Blog posted successfully!");
        setTimeout(() => navigate("/blogs"), 1500);
      } else {
        setError(data.message || "Failed to post blog.");
        toast.error(data.message || "Failed to post blog.");
      }
    } catch (error) {
      setError("An error occurred while posting the blog.");
      toast.error("An error occurred while posting the blog.");
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [form.content]);

  if (!currentUser) return null;

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Write a Blog</h1>
        <button
          type="button"
          onClick={togglePreview}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">
            {form.title || "Untitled Blog"}
          </h2>

          {thumbnailPreview && (
            <div className="mb-6">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="prose max-w-none mb-6">
            {form.content
              .split("\n")
              .map((paragraph, index) =>
                paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
              )}
          </div>

          {galleryPreviews.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryPreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={togglePreview}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Editing
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Blog Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter an engaging title"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-gray-700 font-medium mb-2"
            >
              Blog Content
            </label>
            <textarea
              id="content"
              name="content"
              ref={contentRef}
              value={form.content}
              onChange={handleChange}
              placeholder="Share your travel experience..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-h-[200px] resize-none"
              required
            />
          </div>

          {/* Thumbnail Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Thumbnail Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                <div className="flex flex-col items-center justify-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Click to upload thumbnail
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </label>

              {thumbnailPreview && (
                <div className="w-32 h-32 relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Gallery Images (Optional)
            </label>
            <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">
                  Click to upload gallery images (multiple allowed)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </div>
            </label>

            {galleryPreviews.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">
                  Selected: {gallery.length} image(s)
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Gallery preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGallery([]);
                    setGalleryPreviews([]);
                  }}
                  className="mt-2 text-red-600 text-sm hover:text-red-800 transition-colors"
                >
                  Clear all images
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Featured Blog</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Featured blogs appear prominently on the homepage
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/my-blogs")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? "Posting..." : "Post Blog"}
            </button>
          </div>

          {error && <div className="mt-4 text-red-600">{error}</div>}
        </form>
      )}
    </div>
  );
}
