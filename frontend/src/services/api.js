import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

// Movies API
export const moviesAPI = {
  getMovies: () => api.get("/movies"),
  getMovie: (id) => api.get(`/movies/${id}`),
};

// Movie Service (for backwards compatibility)
export const movieService = {
  getMovieById: (id) => api.get(`/movies/${id}`),
  getMovieReviews: (movieId) => {
    if (!movieId) {
      return Promise.resolve({ data: [] });
    }
    return api.get(`/reviews?movieId=${movieId}`);
  },
  toggleWatchlist: (movieId) => api.put(`/users/watchlist/${movieId}`),
  submitReview: (movieId, reviewData) =>
    api.post("/reviews", { ...reviewData, movieId }),
  likeReview: (reviewId) => api.put(`/reviews/${reviewId}/like`),
  getUserReviews: () => api.get("/reviews/user"),
};

// Blogs API
export const blogsAPI = {
  getBlogs: (approved = true) => api.get(`/blogs?approved=${approved}`),
  getBlog: (id) => api.get(`/blogs/${id}`),
  createBlog: (formData) =>
    api.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  likeBlog: (id) => api.put(`/blogs/${id}/like`),
  addComment: (id, comment) => api.post(`/blogs/${id}/comments`, comment),
};

// Blog Service (for backwards compatibility)
export const blogService = {
  getBlogs: () => api.get("/blogs"),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  createBlog: (formData) =>
    api.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  likeBlog: (id) => api.put(`/blogs/${id}/like`),
  addComment: (id, comment) => api.post(`/blogs/${id}/comments`, comment),
  getUserBlogs: () => api.get("/blogs/user"),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (movieId) => api.get(`/reviews?movieId=${movieId}`),
  createReview: (reviewData) => api.post("/reviews", reviewData),
  likeReview: (id) => api.put(`/reviews/${id}/like`),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  getCompleteProfile: () => api.get("/users/profile/complete"),
  updateProfile: (formData) =>
    api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateWatchlist: (movieId) => api.put(`/users/watchlist/${movieId}`),
};

// Search API
export const searchAPI = {
  search: (query, type) => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append("type", type);
    return api.get(`/search?${params.toString()}`);
  },
};

export default api;
