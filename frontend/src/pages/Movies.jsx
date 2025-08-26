import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { moviesAPI } from "../services/api";
import { Link } from "react-router-dom";
import { Search, Filter, Star, Calendar, Play, ArrowRight } from "lucide-react";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const {
    data: moviesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["movies"],
    queryFn: moviesAPI.getMovies,
  });

  // Memoize movies array to prevent recreation on every render
  const movies = useMemo(() => {
    return moviesData?.data?.movies || [];
  }, [moviesData]);

  // Memoize genres to prevent recreation
  const genres = useMemo(() => {
    return [...new Set(movies.flatMap((movie) => movie.genre || []))];
  }, [movies]);

  // Memoize filtered movies calculation
  const filteredMovies = useMemo(() => {
    let filtered = movies;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (movie) =>
          movie?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie?.genre?.some((g) =>
            g?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter((movie) =>
        movie?.genre?.includes(selectedGenre)
      );
    }

    // Sort movies
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "year":
          return (b.year || 0) - (a.year || 0);
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return 0;
      }
    });

    return sortedFiltered;
  }, [movies, searchQuery, selectedGenre, sortBy]);

  // Memoize clear filters function
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedGenre("");
    setSortBy("popularity");
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error loading movies
          </h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Movies
        </h1>
        <p className="text-gray-600">
          Explore our collection of amazing movies
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Genre Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="popularity">Sort by Popularity</option>
            <option value="title">Sort by Title</option>
            <option value="year">Sort by Year</option>
            <option value="rating">Sort by Rating</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredMovies.length} of {movies.length} movies
        </p>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
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

              {movie.year && (
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {movie.year}
                </div>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                {(movie.genre || []).slice(0, 2).map((g, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {g}
                  </span>
                ))}
                {movie.genre && movie.genre.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{movie.genre.length - 2}
                  </span>
                )}
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

      {/* No Results */}
      {filteredMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No movies found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Movies;
