import React, { useState, useEffect, useCallback } from "react";
import { Trash2, User, Calendar, MessageCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { adminCommentsAPI } from "../services/api";

const CommentModeration = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, blog, review

  const fetchComments = useCallback(async () => {
    try {
      const response = await adminCommentsAPI.getComments();
      setComments(response.data);
    } catch (error) {
      toast.error("Failed to fetch comments");
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const deleteComment = async (commentId, commentType, parentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await adminCommentsAPI.deleteComment(commentId);
      setComments(comments.filter((comment) => comment._id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
      console.error("Error deleting comment:", error);
    }
  };

  const filteredComments = comments.filter((comment) => {
    if (filter === "blog") return comment.type === "blog";
    if (filter === "review") return comment.type === "review";
    return true;
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
          <h2 className="text-2xl font-bold text-gray-900">
            Comment Moderation
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage user comments across the platform
          </p>
        </div>
        <button
          onClick={fetchComments}
          className="admin-button admin-button-primary"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="admin-card">
        <div className="flex space-x-1">
          {[
            { key: "all", label: "All Comments" },
            { key: "blog", label: "Blog Comments" },
            { key: "review", label: "Review Comments" },
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
                  ? comments.length
                  : tab.key === "blog"
                  ? comments.filter((c) => c.type === "blog").length
                  : comments.filter((c) => c.type === "review").length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div key={comment._id} className="admin-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Comment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {comment.user?.username || "Unknown User"}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comment.type === "blog"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {comment.type === "blog" ? (
                        <>
                          <FileText className="h-3 w-3 mr-1" />
                          Blog Comment
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Review Comment
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Parent Content Info */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Comment on:{" "}
                    <span className="font-medium">{comment.parentTitle}</span>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-3">
                  <p className="text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="ml-4">
                <button
                  onClick={() =>
                    deleteComment(comment._id, comment.type, comment.parentId)
                  }
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

      {/* No Comments */}
      {filteredComments.length === 0 && (
        <div className="admin-card text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageCircle className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No comments found
          </h3>
          <p className="text-gray-600">
            {filter === "blog"
              ? "No blog comments to moderate."
              : filter === "review"
              ? "No review comments to moderate."
              : "No comments have been posted yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentModeration;
