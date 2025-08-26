import React, { useState, useEffect } from "react";
import { Users, FileText, Star, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalReviews: 0,
    pendingBlogs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "https://adminmobile-1.onrender.com/api/admin/analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("Failed to fetch statistics");
      }
    } catch (error) {
      toast.error("Network error");
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="admin-card">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${bgColor} rounded-lg p-3`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {loading ? "..." : value || 0}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to the Movie Platform Admin Dashboard
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Total Blogs"
          value={stats.totalBlogs}
          icon={FileText}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={Star}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Pending Blogs"
          value={stats.pendingBlogs || 0}
          icon={TrendingUp}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Pending Approvals */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="admin-card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending Approvals
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">
                Pending Blogs
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {stats.pendingBlogs || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">
                Total Reviews (Auto-Published)
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {stats.totalReviews || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full admin-button admin-button-primary text-left">
              Review Pending Blogs
            </button>
            <button className="w-full admin-button admin-button-primary text-left">
              Manage Reviews
            </button>
            <button className="w-full admin-button admin-button-primary text-left">
              Manage User Roles
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="text-sm text-gray-500">
          No recent activity to display. Check back later for updates.
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
