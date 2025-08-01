import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function UserBlogs() {
  const { currentUser } = useSelector((state) => state.user);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?._id) return;
    fetch(`/api/blogs/user/${currentUser._id}`)
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setLoading(false);
      });
  }, [currentUser]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Blogs</h1>
      <Link
            to="/blogs/write"
            className=" bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
            Write a Blog
        </Link>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No blogs found.</p>
          <p className="text-gray-400 mt-2">Start writing your first blog!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Content Preview</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Featured</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Created Date</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-900">{blog.title}</div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="text-gray-600 text-sm">
                      {truncateContent(blog.content)}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      blog.is_featured 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.is_featured ? 'Featured' : 'Regular'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-gray-600">
                    {formatDate(blog.created_at)}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.location.href = `/blogs/${blog._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}