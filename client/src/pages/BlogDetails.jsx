import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function BlogDetails() {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((res) => res.json())
      .then((data) => setBlog(data.data));
    fetch(`/api/blog-comments/blog/${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data.data || []));
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError("");
    setCommentSuccess("");
    if (!currentUser) {
      setCommentError("You must be signed in to comment.");
      return;
    }
    if (!commentForm.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    const payload = {
      blog_id: id,
      user_id: currentUser._id,
      comment: commentForm,
    };
    const res = await fetch("/api/blog-comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setCommentSuccess("Comment added!");
      setCommentForm("");
      // Refresh comments
      fetch(`/api/blog-comments/blog/${id}`)
        .then((res) => res.json())
        .then((data) => setComments(data.data || []));
    } else {
      setCommentError(data.message || "Failed to add comment.");
    }
  };

  if (!blog) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-gray-600">
            By {blog.user_id?.full_name || "User"}
          </span>
          <span className="text-gray-500">
            {new Date(blog.created_at).toLocaleDateString()}
          </span>
          {blog.is_featured && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Featured
            </span>
          )}
        </div>
        <div className="text-lg text-gray-800 mb-6 whitespace-pre-line">
          {blog.content}
        </div>
      </div>
      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={commentForm}
            onChange={(e) => setCommentForm(e.target.value)}
            placeholder="Write your comment..."
            className="w-full border rounded px-3 py-2 mb-2"
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Comment
          </button>
          {commentError && <div className="text-red-600 mt-2">{commentError}</div>}
          {commentSuccess && <div className="text-green-600 mt-2">{commentSuccess}</div>}
        </form>
        {comments.length === 0 ? (
          <div className="text-gray-500">No comments yet.</div>
        ) : (
          <div>
            {comments.map((c) => (
              <div key={c._id} className="border-b py-3 flex gap-3 items-start">
                <img
                  src={c.user_id?.profilePicture || "/default-avatar.png"}
                  alt={c.user_id?.full_name || "User"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <span className="font-semibold">{c.user_id?.full_name || "User"}</span>
                  <div className="text-gray-700">{c.comment}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}