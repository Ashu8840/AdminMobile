import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Heart,
  MessageCircle,
  Calendar,
  Star,
  Film,
  BookOpen,
  Edit3,
  Save,
  X,
  Camera,
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { movieService, blogService, userAPI } from "../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("watchlist");
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Use the comprehensive profile endpoint to get all data in one call
      const response = await userAPI.getCompleteProfile();
      const data = response.data;

      // Set all the data from the response
      setWatchlistMovies(data.watchlistMovies || []);
      setUserBlogs(data.blogs || []);
      setUserReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching user data:", error);

      // Fallback to individual API calls if the comprehensive endpoint fails
      try {
        // Fetch watchlist movies
        if (user.watchlist && user.watchlist.length > 0) {
          const watchlistPromises = user.watchlist.map(async (movieId) => {
            try {
              const response = await movieService.getMovieById(movieId);
              return response.data || response;
            } catch (error) {
              console.error(`Error fetching movie ${movieId}:`, error);
              return null;
            }
          });
          const watchlistData = await Promise.all(watchlistPromises);
          setWatchlistMovies(watchlistData.filter((movie) => movie));
        }

        // Fetch user blogs
        try {
          const blogsResponse = await blogService.getUserBlogs();
          setUserBlogs(blogsResponse.data || blogsResponse || []);
        } catch (error) {
          console.error("Error fetching user blogs:", error);
          setUserBlogs([]);
        }

        // Fetch user reviews
        try {
          const reviewsResponse = await movieService.getUserReviews();
          setUserReviews(reviewsResponse.data || reviewsResponse || []);
        } catch (error) {
          console.error("Error fetching user reviews:", error);
          setUserReviews([]);
        }
      } catch (fallbackError) {
        console.error("Fallback API calls also failed:", fallbackError);
        toast.error("Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      username: user?.username || "",
      bio: user?.bio || "",
      avatar: null,
    });
    setAvatarPreview(user?.avatar || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({ username: "", bio: "", avatar: null });
    setAvatarPreview("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("username", editForm.username);
      formData.append("bio", editForm.bio);
      if (editForm.avatar) {
        formData.append("avatar", editForm.avatar);
      }

      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data?.user || response.data;

      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      await movieService.toggleWatchlist(movieId);
      setWatchlistMovies(
        watchlistMovies.filter((movie) => movie._id !== movieId)
      );
      toast.success("Removed from watchlist");
    } catch (error) {
      toast.error("Failed to remove from watchlist");
    }
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
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {!isEditing ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {user?.username}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.bio && (
                    <p className="text-gray-700 mt-2 max-w-md">{user.bio}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>
                      Member since{" "}
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={startEditing}
                  className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Film className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {watchlistMovies.length}
              </h3>
              <p className="text-gray-600">Movies in Watchlist</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {userBlogs.length}
              </h3>
              <p className="text-gray-600">Blogs Written</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {userReviews.length}
              </h3>
              <p className="text-gray-600">Reviews Posted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              {
                key: "watchlist",
                label: "My Watchlist",
                count: watchlistMovies.length,
              },
              { key: "blogs", label: "My Blogs", count: userBlogs.length },
              {
                key: "reviews",
                label: "My Reviews",
                count: userReviews.length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Watchlist Tab */}
          {activeTab === "watchlist" && (
            <div>
              {watchlistMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {watchlistMovies.map((movie) => (
                    <div
                      key={movie._id}
                      className="bg-gray-50 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200">
                        <img
                          src={
                            movie.posterUrl ||
                            "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image"
                          }
                          alt={movie.title || "Movie poster"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log(
                              "Image error for movie:",
                              movie.title,
                              "URL:",
                              movie.posterUrl
                            );
                            e.target.src =
                              "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                          {movie.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {movie.year}
                        </p>
                        <div className="flex justify-between">
                          <Link
                            to={`/movie/${movie._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => removeFromWatchlist(movie._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Film className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No movies in watchlist
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start building your watchlist by adding movies you want to
                    watch!
                  </p>
                  <Link
                    to="/movies"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Movies
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Blogs Tab */}
          {activeTab === "blogs" && (
            <div>
              {userBlogs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userBlogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {blog.image && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x225/374151/ffffff?text=No+Image";
                            }}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Link
                              to={`/blog/${blog._id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                            >
                              {blog.title}
                            </Link>
                            <p className="text-gray-600 mt-2 line-clamp-3">
                              {blog.content
                                .replace(/<[^>]*>/g, "")
                                .substring(0, 150)}
                              {blog.content.length > 150 ? "..." : ""}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ml-2 whitespace-nowrap ${
                              blog.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {blog.isApproved ? "Published" : "Pending"}
                          </span>
                        </div>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
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

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {blog.likes?.length || 0}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {blog.comments?.length || 0}
                            </span>
                          </div>
                          <Link
                            to={`/blog/${blog._id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Read More
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No blogs written yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Share your thoughts and experiences with the community!
                  </p>
                  <Link
                    to="/blogs"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write Your First Blog
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              {userReviews.length > 0 ? (
                <div className="space-y-6">
                  {userReviews.map((review) => (
                    <div
                      key={review._id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <Link
                            to={`/movie/${review.movieId}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {review.movieTitle}
                          </Link>
                          <div className="flex items-center mt-2">
                            {[...Array(10)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              {review.rating}/10
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2">{review.content}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Published
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {review.likes?.length || 0} likes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reviews posted yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start reviewing movies to share your opinions with others!
                  </p>
                  <Link
                    to="/movies"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find Movies to Review
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
