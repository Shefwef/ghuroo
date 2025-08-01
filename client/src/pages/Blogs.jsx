import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(data.data || []));
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
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
            <p className="text-gray-700 mb-4 line-clamp-3">{blog.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                By {blog.user_id?.full_name || "User"}
              </span>
              <span>
                {new Date(blog.created_at).toLocaleDateString()}
              </span>
              {blog.is_featured && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}