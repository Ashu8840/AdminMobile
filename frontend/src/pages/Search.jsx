import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search as SearchIcon,
  Film,
  BookOpen,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { searchAPI } from "../services/api";
import toast from "react-hot-toast";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [searchResults, setSearchResults] = useState({
    movies: [],
    blogs: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await searchAPI.search(searchQuery);
      setSearchResults(response.data || { movies: [], blogs: [] });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search. Please try again.");
      setSearchResults({ movies: [], blogs: [] });
    } finally {
      setLoading(false);
    }
  };

  const totalResults =
    (searchResults.movies?.length || 0) + (searchResults.blogs?.length || 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <SearchIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Found {totalResults} results for "{query}"
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: "all", label: "All Results", count: totalResults },
              {
                key: "movies",
                label: "Movies",
                count: searchResults.movies?.length || 0,
              },
              {
                key: "blogs",
                label: "Blogs",
                count: searchResults.blogs?.length || 0,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-8">
        {/* Movies Section */}
        {(activeTab === "all" || activeTab === "movies") &&
          searchResults.movies &&
          searchResults.movies.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Film className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Movies</h2>
                <span className="text-gray-500">
                  ({searchResults.movies.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.movies.map((movie) => (
                  <div
                    key={movie._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200">
                      <img
                        src={
                          movie.posterUrl ||
                          "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image"
                        }
                        alt={movie.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x600/374151/ffffff?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {movie.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{movie.year}</p>
                      <p className="text-gray-500 text-xs mb-3">
                        {movie.genre?.slice(0, 2).join(", ")}
                        {movie.genre?.length > 2 && "..."}
                      </p>
                      <Link
                        to={`/movie/${movie._id}`}
                        className="flex items-center justify-between text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Blogs Section */}
        {(activeTab === "all" || activeTab === "blogs") &&
          searchResults.blogs &&
          searchResults.blogs.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Blogs</h2>
                <span className="text-gray-500">
                  ({searchResults.blogs.length})
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {blog.image && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x225/374151/ffffff?text=No+Image";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <Link
                        to={`/blog/${blog._id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors block mb-3"
                      >
                        {blog.title}
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 200)}
                        {blog.content.length > 200 ? "..." : ""}
                      </p>

                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{blog.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{blog.author?.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/blog/${blog._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                        >
                          <span>Read More</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* No Results */}
        {totalResults === 0 && !loading && (
          <div className="text-center py-12">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or browse our content directly.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/movies"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Film className="h-4 w-4 mr-2" />
                Browse Movies
              </Link>
              <Link
                to="/blogs"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Blogs
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
