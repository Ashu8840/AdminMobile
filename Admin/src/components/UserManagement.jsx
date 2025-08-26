import React, { useState, useEffect, useCallback } from "react";
import { Shield, ShieldOff, User, Mail, Calendar, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminUsersAPI } from "../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminUsersAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const response = await adminUsersAPI.toggleAdmin(userId);
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isAdmin: !currentStatus } : user
        )
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts and admin privileges
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-button admin-button-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </button>
          <button
            onClick={fetchUsers}
            className="admin-button admin-button-secondary"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="admin-card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.bio || "No bio available"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isAdmin
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isAdmin ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          User
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      {user.email !== "ayush.bhrg@gmail.com" && (
                        <button
                          onClick={() =>
                            toggleAdminStatus(user._id, user.isAdmin)
                          }
                          className={`admin-button ${
                            user.isAdmin
                              ? "admin-button-danger"
                              : "admin-button-success"
                          }`}
                        >
                          {user.isAdmin ? (
                            <>
                              <ShieldOff size={16} className="mr-1" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <Shield size={16} className="mr-1" />
                              Make Admin
                            </>
                          )}
                        </button>
                      )}
                      {user.email === "ayush.bhrg@gmail.com" && (
                        <span className="text-xs text-gray-500 px-3 py-2">
                          Protected Admin
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "No users have registered yet."}
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isAdmin).length}
            </div>
            <div className="text-sm text-gray-500">Admin Users</div>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {users.filter((u) => !u.isAdmin).length}
            </div>
            <div className="text-sm text-gray-500">Regular Users</div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

// Add Admin Modal Component
const AddAdminModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        "https://adminmobile-1.onrender.com/api/admin/create-admin",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Admin user created successfully");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to create admin user");
      }
    } catch (error) {
      toast.error("Network error");
      console.error("Error creating admin:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="admin-input"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="admin-input"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="admin-input"
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="admin-button admin-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="admin-button admin-button-primary"
              >
                {submitting ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
