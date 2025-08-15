import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BlogDetails() {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const commentInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const blogRes = await fetch(`/api/blogs/${id}`);
        const blogData = await blogRes.json();
        if (!blogRes.ok)
          throw new Error(blogData.message || "Failed to load blog");
        setBlog(blogData.data);

        
        const commentsRes = await fetch(`/api/blog-comments/blog/${id}`);
        const commentsData = await commentsRes.json();
        if (!commentsRes.ok) throw new Error("Failed to load comments");
        setComments(commentsData.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
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

    try {
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
        toast.success("Comment added successfully!");
        setCommentForm("");
        // Refresh comments
        const commentsRes = await fetch(`/api/blog-comments/blog/${id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData.data || []);
      } else {
        throw new Error(data.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error(error.message);
      setCommentError(error.message);
    }
  };

  const openLightbox = (imageUrl) => {
    setActiveImage(imageUrl);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const scrollToComments = () => {
    commentInputRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => commentInputRef.current?.focus(), 500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Blog Not Found</h2>
          <p className="mb-4">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blogs"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Breadcrumb */}
      <nav className="flex mb-6 text-gray-600 text-sm">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/blogs" className="hover:text-blue-600 transition-colors">
          Blogs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium truncate">{blog.title}</span>
      </nav>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {/* Hero Section with Thumbnail */}
        {blog.thumbnail_url ? (
          <div className="relative w-full h-80 md:h-96 overflow-hidden bg-gray-100">
            <img
              src={blog.thumbnail_url}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onClick={() => openLightbox(blog.thumbnail_url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 sm:p-8 w-full">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-md">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <span className="flex items-center gap-1">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {blog.user_id?.full_name || "User"}
                  </span>
                  <span className="flex items-center gap-1">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(blog.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {blog.is_featured && (
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center drop-shadow-md">
              {blog.title}
            </h1>
          </div>
        )}

        
        <div className="p-6 sm:p-8">
          <div className="prose prose-lg max-w-none text-gray-800 mb-8 whitespace-pre-line">
            {blog.content}
          </div>

          
          <div className="flex flex-wrap gap-3 mb-8 border-t border-b border-gray-100 py-4">
            <button
              onClick={scrollToComments}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              {comments.length} Comments
            </button>

            <button
              onClick={() =>
                window.navigator
                  .share({
                    title: blog.title,
                    text: `Check out this blog: ${blog.title}`,
                    url: window.location.href,
                  })
                  .catch((err) => console.log("Share not supported", err))
              }
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
          </div>

          
          {blog.gallery_urls && blog.gallery_urls.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
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
                Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {blog.gallery_urls.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg shadow-md cursor-pointer group relative"
                    onClick={() => openLightbox(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8" id="comments">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          Comments ({comments.length})
        </h2>

       
        <form
          onSubmit={handleCommentSubmit}
          className="mb-8 bg-gray-50 p-4 rounded-lg"
        >
          <h3 className="text-lg font-medium mb-3">Leave a comment</h3>
          <textarea
            ref={commentInputRef}
            value={commentForm}
            onChange={(e) => setCommentForm(e.target.value)}
            placeholder="Share your thoughts about this blog..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Post Comment
            </button>
            {!currentUser && (
              <span className="text-sm text-gray-500">
                <Link to="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </Link>{" "}
                to comment
              </span>
            )}
          </div>
          {commentError && (
            <div className="text-red-600 mt-2">{commentError}</div>
          )}
        </form>

        
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600">
              Be the first to comment on this blog!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((c) => (
              <div
                key={c._id}
                className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={c.user_id?.profilePicture || "/default-avatar.png"}
                  alt={c.user_id?.full_name || "User"}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800">
                      {c.user_id?.full_name || "User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-gray-700 mt-1">{c.comment}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={closeLightbox}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
          <img
            src={activeImage}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
