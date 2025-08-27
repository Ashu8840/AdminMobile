import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://adminmobile-1.onrender.com/api";
const MOVIE_API_URL = "https://adminmobile-gqli.onrender.com/free";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Create external API instance with timeout
const externalApi = axios.create({
  timeout: 8000, // 8 second timeout for external API
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }
  return config;
});

// Auth services
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

// User services
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  getCompleteProfile: () => api.get("/users/profile/complete"),
  updateProfile: (userData) => api.put("/users/profile", userData),
  updateProfileWithAvatar: (formData) =>
    api.put("/users/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateWatchlist: (movieId) => api.put(`/users/watchlist/${movieId}`),
};

// Blog services
export const blogAPI = {
  getAllBlogs: () => api.get("/blogs"),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  createBlog: (formData) =>
    api.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateBlog: (id, blogData) => api.put(`/blogs/${id}`, blogData),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  likeBlog: (id) => api.put(`/blogs/${id}/like`),
  commentOnBlog: (id, comment) =>
    api.post(`/blogs/${id}/comments`, { text: comment }),
  getUserBlogs: () => api.get("/blogs/user"),
};

// Review services
export const reviewAPI = {
  getAllReviews: () => api.get("/reviews"),
  createReview: (reviewData) => api.post("/reviews", reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  likeReview: (id) => api.put(`/reviews/${id}/like`),
  getUserReviews: () => api.get("/reviews/user"),
};

// Movie services (external API + backend for movies endpoint)
export const movieAPI = {
  // Get from external API with timeout and fallback
  getAllMovies: async () => {
    try {
      console.log("Fetching movies from external API...");
      const response = await externalApi.get(MOVIE_API_URL);
      console.log("External API response:", response.data);
      return { data: response.data.movies || [] };
    } catch (error) {
      console.error("Error fetching movies from external API:", error);

      // Try backend as fallback
      try {
        console.log("Trying backend as fallback...");
        const backendResponse = await api.get("/movies");
        return { data: backendResponse.data || [] };
      } catch (backendError) {
        console.error("Backend fallback also failed:", backendError);
        // Return empty array so app doesn't crash
        return { data: [] };
      }
    }
  },
  // Get from backend (if available)
  getBackendMovies: () => api.get("/movies"),
  getMovieById: (id) => api.get(`/movies/${id}`),
  searchMovies: async (query) => {
    try {
      console.log("Searching movies...");
      const response = await externalApi.get(MOVIE_API_URL);
      const movies = response.data.movies || [];
      const filteredMovies = movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(query.toLowerCase()) ||
          (movie.genre && Array.isArray(movie.genre)
            ? movie.genre.some((g) =>
                g.toLowerCase().includes(query.toLowerCase())
              )
            : movie.genre.toLowerCase().includes(query.toLowerCase()))
      );
      return { data: filteredMovies };
    } catch (error) {
      console.error("Error searching movies:", error);
      return { data: [] }; // Return empty array instead of throwing
    }
  },
  // Get from backend (if available)
  getBackendMovies: () => api.get("/movies"),
  getMovieById: (id) => api.get(`/movies/${id}`),
};

// Search services
export const searchAPI = {
  searchAll: async (query) => {
    try {
      const [moviesResponse, blogsResponse] = await Promise.all([
        movieAPI.searchMovies(query),
        api.get(`/blogs/search?q=${query}`),
      ]);

      return {
        movies: moviesResponse.data,
        blogs: blogsResponse.data,
      };
    } catch (error) {
      console.error("Error in search:", error);
      throw error;
    }
  },
};

// Admin services
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: () => api.get("/admin/users"),
  toggleUserAdmin: (userId) => api.put(`/admin/users/${userId}/toggle-admin`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getPendingBlogs: () => api.get("/admin/blogs/pending"),
  approveBlog: (blogId) => api.put(`/admin/blogs/${blogId}/approve`),
  rejectBlog: (blogId) => api.put(`/admin/blogs/${blogId}/reject`),
  getPendingReviews: () => api.get("/admin/reviews/pending"),
  approveReview: (reviewId) => api.put(`/admin/reviews/${reviewId}/approve`),
  rejectReview: (reviewId) => api.put(`/admin/reviews/${reviewId}/reject`),
};

// Storage helpers
export const storage = {
  setToken: (token) => AsyncStorage.setItem("token", token),
  getToken: () => AsyncStorage.getItem("token"),
  removeToken: () => AsyncStorage.removeItem("token"),
  setUser: (user) => AsyncStorage.setItem("user", JSON.stringify(user)),
  getUser: async () => {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => AsyncStorage.removeItem("user"),
};

export default api;
