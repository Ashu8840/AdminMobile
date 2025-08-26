import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  FileText,
  Star,
  TrendingUp,
  Eye,
  ThumbsUp,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAnalyticsAPI } from "../services/api";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalReviews: 0,
    pendingBlogs: 0,
    totalLikes: 0,
    totalViews: 0,
    newUsersThisMonth: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await adminAnalyticsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to fetch analytics data");
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="admin-card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div
            className={`flex items-center justify-center h-12 w-12 rounded-lg ${color}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {trend && (
              <div
                className={`flex items-center text-sm ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${
                    trend.positive ? "" : "transform rotate-180"
                  }`}
                />
                {trend.value}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getEngagementData = () => {
    const totalContent = stats.totalBlogs + stats.totalReviews;
    const totalEngagement = stats.totalLikes + stats.totalViews;

    return {
      contentCreated: totalContent,
      engagement: totalEngagement,
      avgEngagementPerContent:
        totalContent > 0 ? Math.round(totalEngagement / totalContent) : 0,
    };
  };

  const getModerationData = () => {
    const totalPending = stats.pendingBlogs;
    const totalApproved =
      stats.totalBlogs - stats.pendingBlogs + stats.totalReviews; // All reviews are now auto-approved

    return {
      pending: totalPending,
      approved: totalApproved,
      total: totalPending + totalApproved,
      approvalRate:
        totalPending + totalApproved > 0
          ? Math.round((totalApproved / (totalPending + totalApproved)) * 100)
          : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const engagementData = getEngagementData();
  const moderationData = getModerationData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Overview of platform performance and user engagement
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="admin-input"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="admin-button admin-button-primary"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${stats.newUsersThisMonth} new this month`}
          trend={{ positive: true, value: 12 }}
        />

        <StatCard
          title="Total Blogs"
          value={stats.totalBlogs.toLocaleString()}
          icon={FileText}
          color="bg-green-500"
          subtitle={`${stats.pendingBlogs} pending approval`}
        />

        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toLocaleString()}
          icon={Star}
          color="bg-yellow-500"
          subtitle="All reviews auto-published"
        />

        <StatCard
          title="Avg Rating"
          value={stats.averageRating.toFixed(1)}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle="Out of 10.0"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Content Engagement
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Total Likes</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats.totalLikes.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Total Views</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Avg Engagement</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {engagementData.avgEngagementPerContent}
              </span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Content Moderation
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Review</span>
              <span className="text-lg font-semibold text-yellow-600">
                {moderationData.pending}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-green-600">
                {moderationData.approved}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="text-lg font-semibold text-gray-900">
                {moderationData.approvalRate}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Content Status</span>
                <span>
                  {moderationData.approved}/{moderationData.total} approved
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${moderationData.approvalRate}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Platform Summary
          </h3>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {(
                (stats.totalLikes + stats.totalViews) /
                Math.max(stats.totalUsers, 1)
              ).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Engagement per User</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {(
                (stats.totalBlogs + stats.totalReviews) /
                Math.max(stats.totalUsers, 1)
              ).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Content per User</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Math.round(
                ((stats.totalBlogs - stats.pendingBlogs + stats.totalReviews) / // All reviews are auto-approved
                  Math.max(stats.totalBlogs + stats.totalReviews, 1)) *
                  100
              )}
              %
            </div>
            <div className="text-sm text-gray-600">Content Approval Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className="admin-button admin-button-primary">
            Export Analytics Report
          </button>
          <button className="admin-button admin-button-secondary">
            View Detailed Reports
          </button>
          <button className="admin-button admin-button-secondary">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
