import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/request";
      const response = await fetch(
        `https://adminmobile-gqli.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (isLoginMode) {
          onLogin(data.token, data.user);
          setMessage("Login successful!");
        } else {
          setMessage(
            "Request submitted successfully. Wait for admin approval."
          );
          setFormData({ email: "", password: "" });
          setTimeout(() => {
            setIsLoginMode(true);
          }, 2000);
        }
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Movie Admin Portal
            </h1>
            <p className="text-gray-600">
              {isLoginMode
                ? "Sign in to your account"
                : "Request access to the portal"}
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md mb-6 ${
                message.includes("successful") || message.includes("submitted")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLoginMode ? "Signing in..." : "Submitting..."}
                </div>
              ) : isLoginMode ? (
                "Sign In"
              ) : (
                "Submit Request"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setMessage("");
                setFormData({ email: "", password: "" });
              }}
              className="text-blue-600 hover:text-blue-500 font-medium transition duration-200"
            >
              {isLoginMode
                ? "Need access? Request here"
                : "Already have access? Sign in"}
            </button>
          </div>

          {isLoginMode && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">
                <p>Demo Admin Credentials:</p>
                <p className="font-mono">ayush.bhrg@gmail.com / ayushtri</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
