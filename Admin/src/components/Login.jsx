import React, { useState } from "react";
import toast from "react-hot-toast";
import { adminAuthAPI } from "../services/api";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if it's the protected admin account
      if (
        formData.email === "ayush.bhrg@gmail.com" &&
        formData.password === "ayushtri"
      ) {
        const adminUser = {
          id: "admin-protected",
          email: "ayush.bhrg@gmail.com",
          name: "Admin",
          isAdmin: true,
        };

        localStorage.setItem("adminToken", "protected-admin-token");
        localStorage.setItem("adminUser", JSON.stringify(adminUser));
        onLogin("protected-admin-token", adminUser);
        toast.success("Login successful!");
        return;
      }

      const response = await adminAuthAPI.login(formData);
      const data = response.data;

      if (data.user.isAdmin) {
        onLogin(data.token, data.user);
        toast.success("Login successful!");
      } else {
        toast.error("Access denied. Admin privileges required.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-600">Movie Platform Administration</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="admin-input"
                placeholder="Enter admin email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="admin-input"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full admin-button admin-button-primary py-3 text-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
