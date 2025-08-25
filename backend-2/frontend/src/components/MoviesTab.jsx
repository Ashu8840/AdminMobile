import React, { useState, useEffect } from "react";
import MovieForm from "./MovieForm";
import MovieCard from "./MovieCard";

const MoviesTab = ({ user }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://adminmobile-gqli.onrender.com/api/movies",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      } else {
        setMessage("Failed to fetch movies");
      }
    } catch (error) {
      setMessage("Network error");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieAdded = (newMovie) => {
    setMovies([newMovie, ...movies]);
    setShowForm(false);
    setMessage("Movie added successfully");
  };

  const handleMovieUpdated = (updatedMovie) => {
    setMovies(
      movies.map((movie) =>
        movie._id === updatedMovie._id ? updatedMovie : movie
      )
    );
    setEditingMovie(null);
    setShowForm(false);
    setMessage("Movie updated successfully");
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://adminmobile-gqli.onrender.com/api/movies/${movieId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMovies(movies.filter((movie) => movie._id !== movieId));
        setMessage("Movie deleted successfully");
      } else {
        setMessage("Failed to delete movie");
      }
    } catch (error) {
      setMessage("Network error");
      console.error("Error:", error);
    }
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Movies Management</h2>
        <div className="space-x-2">
          <button
            onClick={fetchMovies}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
          >
            Refresh
          </button>
          {user.isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Add Movie
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("successfully")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {showForm && (
        <MovieForm
          movie={editingMovie}
          onMovieAdded={handleMovieAdded}
          onMovieUpdated={handleMovieUpdated}
          onClose={handleCloseForm}
        />
      )}

      {movies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
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
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Movies Found
          </h3>
          <p className="text-gray-600">
            {user.isAdmin
              ? "Start by adding your first movie."
              : "No movies available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onEdit={user.isAdmin ? handleEditMovie : null}
              onDelete={user.isAdmin ? handleDeleteMovie : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesTab;
