import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { moviesAPI, blogsAPI } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import {
  Film,
  BookOpen,
  TrendingUp,
  Users,
  ArrowRight,
  Star,
  Play,
  Plus,
} from "lucide-react";

const Home = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  const { data: moviesData } = useQuery({
    queryKey: ["movies"],
    queryFn: moviesAPI.getMovies,
  });

  const { data: blogsData } = useQuery({
    queryKey: ["blogs"],
    queryFn: () => blogsAPI.getBlogs(true),
  });

  // Fetch user count for stats
  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      try {
        const response = await fetch(
          "https://adminmobile-1.onrender.com/api/users/count"
        );
        if (response.ok) {
          return await response.json();
        }
        return { userCount: 0 };
      } catch (error) {
        console.error("Error fetching user stats:", error);
        return { userCount: 0 };
      }
    },
  });

  const movies = moviesData?.data?.movies || [];
  const blogs = blogsData?.data || [];
  const userCount = statsData?.userCount || 0;

  // Get different movie categories
  const featuredMovies = movies.slice(0, 6);
  const topRatedMovies = movies
    .filter((movie) => movie.averageRating > 7)
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 8);
  const recentMovies = movies.slice(-8);
  const recentBlogs = blogs.slice(0, 3);

  // Get recommended movies based on user's watchlist genres (if authenticated)
  const getRecommendedMovies = () => {
    if (!isAuthenticated || !user?.watchlist?.length) {
      return movies.slice(0, 8);
    }

    // This is a simplified recommendation - in a real app you'd have more sophisticated logic
    const watchlistMovies = movies.filter((movie) =>
      user.watchlist.includes(movie._id)
    );

    if (watchlistMovies.length === 0) {
      return movies.slice(0, 8);
    }

    const watchlistGenres = new Set();
    watchlistMovies.forEach((movie) => {
      movie.genre?.forEach((g) => watchlistGenres.add(g));
    });

    const recommended = movies
      .filter(
        (movie) =>
          !user.watchlist.includes(movie._id) &&
          movie.genre?.some((g) => watchlistGenres.has(g))
      )
      .slice(0, 8);

    return recommended.length > 0 ? recommended : movies.slice(0, 8);
  };

  const recommendedMovies = getRecommendedMovies();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Movies
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Explore trending movies, read reviews, and share your thoughts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/movies"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                <Film className="mr-2 h-5 w-5" />
                Browse Movies
              </Link>
              <Link
                to="/blogs"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Read Blogs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Film className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {movies.length}+
              </h3>
              <p className="text-gray-600">Movies Available</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {blogs.length}+
              </h3>
              <p className="text-gray-600">Blog Posts</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {userCount}+
              </h3>
              <p className="text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Movies
              </h2>
              <p className="text-gray-600">Discover the most popular movies</p>
            </div>
            <Link
              to="/movies"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMovies.map((movie) => (
              <Link
                key={movie._id}
                to={`/movie/${movie._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200">
                  <img
                    src={
                      movie.posterUrl ||
                      "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image"
                    }
                    alt={movie.title || "Movie poster"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image";
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{movie.year}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.slice(0, 2).map((g, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600 ml-1">
                        {movie.averageRating}/10
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Section - only show if user is logged in */}
      {isAuthenticated && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Recommended for You
                </h2>
                <p className="text-gray-600">
                  Based on your watchlist and preferences
                </p>
              </div>
              <Link
                to="/movies"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedMovies.map((movie) => (
                <div
                  key={movie._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                >
                  <div className="relative">
                    <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200">
                      <img
                        src={
                          movie.posterUrl ||
                          "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image"
                        }
                        alt={movie.title || "Movie poster"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image";
                        }}
                        loading="lazy"
                      />
                    </div>

                    {/* Rating Badge */}
                    {movie.averageRating > 0 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs font-semibold">
                          {movie.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 pb-12">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {movie.title}
                    </h3>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {(movie.genre || []).slice(0, 2).map((g, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow Button - Bottom Right Corner */}
                  <Link
                    to={`/movie/${movie._id}`}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg group-hover:scale-110 transform transition-transform duration-200"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Movies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Top Rated Movies
              </h2>
              <p className="text-gray-600">Highest rated by our community</p>
            </div>
            <Link
              to="/movies"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedMovies.map((movie) => (
              <Link
                key={movie._id}
                to={`/movie/${movie._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="relative">
                  <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200">
                    <img
                      src={
                        movie.posterUrl ||
                        "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image"
                      }
                      alt={movie.title || "Movie poster"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image";
                      }}
                      loading="lazy"
                    />
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 fill-current mr-1" />
                    <span className="text-xs font-semibold">
                      {movie.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{movie.year}</p>
                  <div className="flex flex-wrap gap-1">
                    {(movie.genre || []).slice(0, 2).map((g, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Blogs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Latest Blogs
              </h2>
              <p className="text-gray-600">
                Read the latest movie insights and reviews
              </p>
            </div>
            <Link
              to="/blogs"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentBlogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blog/${blog._id}`}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {blog.image && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {blog.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>By {blog.author?.username}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
