import axios from "axios";

const API_BASE_URL = "https://adminmobile-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Admin Auth API
export const adminAuthAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
};

// Admin Users API
export const adminUsersAPI = {
  getUsers: () => api.get("/admin/users"),
  toggleAdmin: (userId) => api.put(`/admin/users/${userId}/toggle-admin`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Admin Blogs API
export const adminBlogsAPI = {
  getBlogs: (approved = null) => {
    const url =
      approved !== null ? `/admin/blogs?approved=${approved}` : "/admin/blogs";
    return api.get(url);
  },
  approveBlog: (blogId) => api.put(`/admin/blogs/${blogId}/approve`),
  deleteBlog: (blogId) => api.delete(`/admin/blogs/${blogId}`),
};

// Admin Reviews API
export const adminReviewsAPI = {
  getReviews: () => api.get("/admin/reviews"),
  deleteReview: (reviewId) => api.delete(`/admin/reviews/${reviewId}`),
};

// Admin Comments API
export const adminCommentsAPI = {
  getComments: () => api.get("/admin/comments"),
  deleteComment: (commentId) => api.delete(`/admin/comments/${commentId}`),
};

// Admin Analytics API
export const adminAnalyticsAPI = {
  getStats: () => api.get("/admin/analytics"),
};

export default api;
