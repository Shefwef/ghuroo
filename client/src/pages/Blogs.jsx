import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        console.log("Blogs data:", data.data);
        setBlogs(data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
      });
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Blogs</h1>
        {currentUser && (
          <Link
            to="/blogs/write"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Write a Blog
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/blogs/${blog._id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {blog.thumbnail_url ? (
              <div className="w-full h-48 overflow-hidden bg-gray-200">
                <img
                  src={blog.thumbnail_url}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.log("Image failed to load:", blog.thumbnail_url);
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center text-gray-400">No Image</div>';
                  }}
                  onLoad={() =>
                    console.log(
                      "Image loaded successfully:",
                      blog.thumbnail_url
                    )
                  }
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}

            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
              <p
                className="text-gray-700 mb-4 overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {blog.content}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-2">
                <span>By {blog.user_id?.full_name || "User"}</span>
                <div className="flex items-center gap-2">
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  {blog.is_featured && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
