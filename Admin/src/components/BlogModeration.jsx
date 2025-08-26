import React, { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminBlogsAPI } from "../services/api";

const BlogModeration = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, approved (no more pending since auto-approved)
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBlogs = useCallback(async () => {
    try {
      // Since blogs are auto-approved, we mainly fetch approved blogs
      const approved = filter === "all" ? null : true;
      const response = await adminBlogsAPI.getBlogs(approved);
      setBlogs(response.data);
    } catch (error) {
      toast.error("Failed to fetch blogs");
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const deleteBlog = async (blogId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this blog? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await adminBlogsAPI.deleteBlog(blogId);
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
      toast.success("Blog deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog");
      console.error("Error deleting blog:", error);
    }
  };

  const viewBlog = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setShowModal(false);
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (filter === "approved") return blog.isApproved;
    return true; // Show all blogs since they're auto-approved
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage published blogs - delete inappropriate content
          </p>
        </div>
        <button
          onClick={fetchBlogs}
          className="admin-button admin-button-primary"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="admin-card">
        <div className="flex space-x-1">
          {[
            { key: "all", label: "All Blogs" },
            { key: "approved", label: "Published Blogs" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === tab.key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {tab.key === "all"
                  ? blogs.length
                  : blogs.filter((b) => b.isApproved).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div key={blog._id} className="admin-card h-fit">
            {/* Blog Image */}
            {blog.image && (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                <img
                  src={blog.image}
                  alt="Blog cover"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x225/374151/ffffff?text=No+Image";
                  }}
                />
              </div>
            )}

            {/* Blog Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {blog.author?.avatar ? (
                    <img
                      src={blog.author.avatar}
                      alt={blog.author.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {blog.author?.username || "Unknown Author"}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    blog.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {blog.isApproved ? "Published" : "Draft"}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {blog.title}
              </h3>

              {/* Content Preview */}
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {blog.content?.replace(/<[^>]*>/g, "") ||
                  "No content available"}
              </p>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {blog.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{blog.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {blog.likes?.length || 0}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {blog.comments?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => viewBlog(blog)}
                className="flex-1 admin-button bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"
              >
                <Eye size={16} className="mr-1" />
                View
              </button>
              <button
                onClick={() => deleteBlog(blog._id)}
                className="flex-1 admin-button admin-button-danger flex items-center justify-center"
              >
                <X size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="admin-card text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No blogs found
          </h3>
          <p className="text-gray-600">
            {filter === "approved"
              ? "No published blogs found."
              : "No blogs have been submitted yet."}
          </p>
        </div>
      )}

      {/* Blog View Modal */}
      {showModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Blog Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Blog Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedBlog.title}
                  </h1>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {selectedBlog.author?.avatar ? (
                        <img
                          src={selectedBlog.author.avatar}
                          alt={selectedBlog.author.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {selectedBlog.author?.username || "Unknown Author"}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(
                            selectedBlog.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {selectedBlog.likes?.length || 0} likes
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {selectedBlog.comments?.length || 0} comments
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedBlog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBlog.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedBlog.isApproved ? "Published" : "Draft"}
                </span>
              </div>

              {/* Blog Image */}
              {selectedBlog.image && (
                <div className="mb-6">
                  <img
                    src={selectedBlog.image}
                    alt="Blog cover"
                    className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/800x400/374151/ffffff?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}

              {/* Blog Content */}
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedBlog.content}
                </div>
              </div>

              {/* Comments Section */}
              {selectedBlog.comments && selectedBlog.comments.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Comments ({selectedBlog.comments.length})
                  </h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {selectedBlog.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="flex space-x-3 bg-gray-50 p-3 rounded-lg"
                      >
                        {comment.user?.avatar ? (
                          <img
                            src={comment.user.avatar}
                            alt={comment.user.username}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.user?.username || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Blog ID: {selectedBlog._id}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    deleteBlog(selectedBlog._id);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Delete Blog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogModeration;
