import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Calendar,
  User,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { blogService } from "../services/api";
import toast from "react-hot-toast";

const BlogDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      const response = await blogService.getBlogById(id);
      setBlog(response.data || response);
    } catch (error) {
      toast.error("Failed to fetch blog details");
      console.error("Error fetching blog details:", error);
    } finally {
      setLoading(false);
    }
  };

  const likeBlog = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like this blog");
      return;
    }

    try {
      await blogService.likeBlog(id);
      fetchBlogDetail();
    } catch (error) {
      toast.error("Failed to like blog");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmittingComment(true);
    try {
      await blogService.addComment(id, { text: newComment });
      setNewComment("");
      fetchBlogDetail();
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.content.substring(0, 100) + "...",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Blog not found
          </h2>
          <p className="text-gray-600 mb-4">
            The blog you're looking for doesn't exist.
          </p>
          <Link to="/blogs" className="text-blue-600 hover:text-blue-800">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/blogs"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Link>
      </div>

      {/* Blog Content */}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Featured Image */}
          {(blog?.image || blog?.imageUrl) && (
            <div className="lg:w-1/2 lg:flex-shrink-0">
              <div className="aspect-video lg:aspect-square w-full h-64 lg:h-full overflow-hidden">
                <img
                  src={blog.image || blog.imageUrl}
                  alt={blog?.title || "Blog image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/600x600/374151/ffffff?text=Image+Not+Found";
                  }}
                />
              </div>
            </div>
          )}

          {/* Right Side - Content */}
          <div
            className={`p-6 md:p-8 flex-1 ${
              !(blog?.image || blog?.imageUrl) ? "lg:w-full" : "lg:w-1/2"
            }`}
          >
            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>

            {/* Author and Date Info */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <img
                  src={blog.author?.avatar || "/default-avatar.jpg"}
                  alt={blog.author?.username}
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {blog.author?.username}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={likeBlog}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      blog.likes?.includes(user?._id)
                        ? "fill-current text-red-500"
                        : ""
                    }`}
                  />
                  <span>{blog.likes?.length || 0}</span>
                </button>

                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-5 w-5" />
                  <span>{blog.comments?.length || 0}</span>
                </div>

                <button
                  onClick={sharePost}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="hidden md:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div
              className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({blog.comments?.length || 0})
          </h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={submitComment} className="mb-8">
              <div className="flex items-start space-x-4">
                <img
                  src={user?.avatar || "/default-avatar.jpg"}
                  alt={user?.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">
                Please login to join the conversation
              </p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {blog.comments && blog.comments.length > 0 ? (
              blog.comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-4">
                  <img
                    src={comment.user?.avatar || "/default-avatar.jpg"}
                    alt={comment.user?.username}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.user?.username}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No comments yet
                </h3>
                <p className="text-gray-600">
                  {isAuthenticated
                    ? "Be the first to share your thoughts!"
                    : "Login to start the conversation."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
