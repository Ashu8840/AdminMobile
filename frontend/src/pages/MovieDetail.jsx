import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  Star,
  Plus,
  Check,
  Heart,
  Share2,
  Calendar,
  Clock,
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import { movieService } from "../services/api";
import toast from "react-hot-toast";

const MovieDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, content: "" });
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (user && user.watchlist) {
      setIsInWatchlist(user.watchlist.includes(id));
    }
  }, [user, id]);

  const fetchMovieDetails = async () => {
    try {
      const response = await movieService.getMovieById(id);
      setMovie(response.data || response);
    } catch (error) {
      toast.error("Failed to fetch movie details");
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await movieService.getMovieReviews(id);
      setReviews(response.data || response);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to watchlist");
      return;
    }

    try {
      await movieService.toggleWatchlist(id);
      setIsInWatchlist(!isInWatchlist);
      toast.success(
        isInWatchlist ? "Removed from watchlist" : "Added to watchlist"
      );
    } catch (error) {
      toast.error("Failed to update watchlist");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      return;
    }

    if (newReview.rating === 0 || !newReview.content.trim()) {
      toast.error("Please provide both rating and review content");
      return;
    }

    setSubmittingReview(true);
    try {
      await movieService.submitReview(id, {
        ...newReview,
        movieTitle: movie?.title || movie?.name,
      });
      setNewReview({ rating: 0, content: "" });
      fetchReviews();
      toast.success(
        "Review submitted successfully! It will be visible after approval."
      );
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const likeReview = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error("Please login to like reviews");
      return;
    }

    try {
      await movieService.likeReview(reviewId);
      fetchReviews();
    } catch (error) {
      toast.error("Failed to like review");
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
            onClick={() =>
              interactive && onRatingChange && onRatingChange(i + 1)
            }
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Movie not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-xl bg-gray-200">
                <img
                  src={
                    movie.posterUrl ||
                    "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image"
                  }
                  alt={movie.title || movie.name || "Movie poster"}
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
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2 text-white">
              <h1 className="text-4xl font-bold mb-4">
                {movie.title || movie.name}
              </h1>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="text-lg font-semibold">
                    {movie.vote_average?.toFixed(1)}/10
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{movie.release_date || movie.first_air_date}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
              </div>

              <p className="text-lg mb-6 leading-relaxed">{movie.overview}</p>

              {/* Genres */}
              {movie.genres && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-blue-600 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={toggleWatchlist}
                  className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isInWatchlist
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </button>

                <button className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          {/* Submit Review */}
          {isAuthenticated && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={submitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  {renderStars(newReview.rating, true, (rating) =>
                    setNewReview({ ...newReview, rating })
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) =>
                      setNewReview({ ...newReview, content: e.target.value })
                    }
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your thoughts about this movie..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={review.user?.avatar || "/default-avatar.jpg"}
                        alt={review.user?.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {review.user?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-gray-700 mb-4">{review.content}</p>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => likeReview(review._id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          review.likes?.includes(user?._id)
                            ? "fill-current text-red-500"
                            : ""
                        }`}
                      />
                      <span>{review.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
