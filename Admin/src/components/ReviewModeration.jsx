import React, { useState, useEffect, useCallback } from "react";
import { Trash2, Star, ThumbsUp, Calendar, User, Film } from "lucide-react";
import toast from "react-hot-toast";
import { adminReviewsAPI } from "../services/api";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await adminReviewsAPI.getReviews();
      setReviews(response.data);
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await adminReviewsAPI.deleteReview(reviewId);
      setReviews(reviews.filter((review) => review._id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
      console.error("Error deleting review:", error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {rating}/10
        </span>
      </div>
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">
            Review Moderation
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user reviews - all reviews are automatically published
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="admin-button admin-button-primary"
        >
          Refresh
        </button>
      </div>

      {/* Reviews Stats */}
      <div className="admin-card">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {reviews.length}
          </div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="admin-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Review Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.user?.username || "Unknown User"}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {review.likes?.length || 0} likes
                    </div>
                  </div>

                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                </div>

                {/* Movie Info */}
                <div className="flex items-center space-x-2 mb-3 p-3 bg-gray-50 rounded-lg">
                  <Film className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {review.movieTitle}
                    </div>
                    <div className="text-xs text-gray-500">
                      Movie ID: {review.movieId}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">{renderStars(review.rating)}</div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {review.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => deleteReview(review._id)}
                  className="admin-button admin-button-danger flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600">No reviews have been submitted yet.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
