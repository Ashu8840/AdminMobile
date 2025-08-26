import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { blogService } from "../services/api";
import toast from "react-hot-toast";

const Blogs = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(blogs) ? blogs : [];

    if (searchQuery) {
      filtered = filtered.filter(
        (blog) =>
          blog?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(
        (blog) => Array.isArray(blog?.tags) && blog.tags.includes(selectedTag)
      );
    }

    setFilteredBlogs(filtered);
  }, [blogs, searchQuery, selectedTag]);

  const fetchBlogs = async () => {
    try {
      const response = await blogService.getBlogs();
      const blogsData = response.data || response;
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
    } catch (error) {
      toast.error("Failed to fetch blogs");
      console.error("Error fetching blogs:", error);
      setBlogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const likeBlog = async (blogId) => {
    if (!isAuthenticated) {
      toast.error("Please login to like blogs");
      return;
    }

    try {
      await blogService.likeBlog(blogId);
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to like blog");
    }
  };

  const getAllTags = () => {
    const tags = new Set();
    if (Array.isArray(blogs)) {
      blogs.forEach((blog) => {
        if (Array.isArray(blog?.tags)) {
          blog.tags.forEach((tag) => tags.add(tag));
        }
      });
    }
    return Array.from(tags);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Community Blogs
          </h1>
          <p className="text-gray-600">
            Share your thoughts and discover amazing stories from the community
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Write Blog
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Tags</option>
              {getAllTags().map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredBlogs?.length || 0} of {blogs?.length || 0} blogs
        </p>
      </div>

      {/* Blogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filteredBlogs) &&
          filteredBlogs.map((blog) => (
            <div
              key={blog?._id || Math.random()}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Blog Image */}
              {(blog?.image || blog?.imageUrl) && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={blog.image || blog.imageUrl}
                    alt={blog?.title || "Blog image"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x225/374151/ffffff?text=No+Image";
                    }}
                  />
                </div>
              )}

              <div className="p-6">
                {/* Title */}
                <Link to={`/blog/${blog?._id}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                    {blog?.title || "Untitled Blog"}
                  </h3>
                </Link>

                {/* Content Preview */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog?.content
                    ? blog.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                      "..."
                    : "No content available"}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(blog?.tags) &&
                    blog.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  {Array.isArray(blog?.tags) && blog.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{blog.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Author and Date */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <img
                      src={blog?.author?.avatar || "/default-avatar.jpg"}
                      alt={blog?.author?.username || "Author"}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                    <span>{blog?.author?.username || "Unknown Author"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {blog?.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString()
                      : "Unknown date"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => likeBlog(blog?._id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          Array.isArray(blog?.likes) &&
                          blog.likes.includes(user?._id)
                            ? "fill-current text-red-500"
                            : ""
                        }`}
                      />
                      <span>
                        {Array.isArray(blog?.likes) ? blog.likes.length : 0}
                      </span>
                    </button>

                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>{blog.comments?.length || 0}</span>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${blog._id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* No Results */}
      {filteredBlogs.length === 0 && (
        <div className="text-center py-12">
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No blogs found
          </h3>
          <p className="text-gray-600 mb-4">
            {blogs.length === 0
              ? "Be the first to share a blog with the community!"
              : "Try adjusting your search or filter criteria"}
          </p>
          {isAuthenticated && blogs.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write First Blog
            </button>
          )}
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <CreateBlogModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchBlogs();
          }}
        />
      )}
    </div>
  );
};

// Create Blog Modal Component
const CreateBlogModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageOption, setImageOption] = useState("url"); // "url" or "file"
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPG, PNG, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("content", formData.content.trim());
      formDataToSend.append("tags", formData.tags.trim());

      // Handle image based on selected option
      if (imageOption === "file" && imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (imageOption === "url" && formData.imageUrl.trim()) {
        formDataToSend.append("imageUrl", formData.imageUrl.trim());
      }

      await blogService.createBlog(formDataToSend);
      toast.success(
        "Blog submitted successfully! It will be visible after approval."
      );
      onSuccess();
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Write a Blog</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows="8"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your blog content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., movies, review, entertainment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image (optional)
              </label>

              {/* Image Option Selector */}
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="imageOption"
                    value="url"
                    checked={imageOption === "url"}
                    onChange={(e) => setImageOption(e.target.value)}
                    className="mr-2"
                  />
                  Image URL
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="imageOption"
                    value="file"
                    checked={imageOption === "file"}
                    onChange={(e) => setImageOption(e.target.value)}
                    className="mr-2"
                  />
                  Upload from Computer
                </label>
              </div>

              {/* Conditional Input Based on Selected Option */}
              {imageOption === "url" ? (
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imageFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {imageFile.name}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: JPG, PNG, WebP. Max size: 5MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Publishing..." : "Publish Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
