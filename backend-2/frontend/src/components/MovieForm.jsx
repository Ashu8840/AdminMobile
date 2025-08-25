import React, { useState } from "react";

const MovieForm = ({ movie, onMovieAdded, onMovieUpdated, onClose }) => {
  const [formData, setFormData] = useState({
    title: movie?.title || "",
    description: movie?.description || "",
    year: movie?.year || new Date().getFullYear(),
    genre: movie?.genre?.join(", ") || "",
    director: movie?.director || "",
    cast: movie?.cast?.join(", ") || "",
    trailerUrl: movie?.trailerUrl || "",
    averageRating: movie?.averageRating || 0,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("genre", formData.genre);
      formDataToSend.append("director", formData.director);
      formDataToSend.append("cast", formData.cast);
      formDataToSend.append("trailerUrl", formData.trailerUrl);
      formDataToSend.append("averageRating", formData.averageRating);

      // Append poster file if selected
      if (posterFile) {
        formDataToSend.append("poster", posterFile);
      }

      const url = movie
        ? `https://adminmobile-gqli.onrender.com/api/movies/${movie._id}`
        : "https://adminmobile-gqli.onrender.com/api/movies";

      const method = movie ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        if (movie) {
          onMovieUpdated(data.movie);
        } else {
          onMovieAdded(data.movie);
        }
        setMessage(`Movie ${movie ? "updated" : "added"} successfully!`);
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {movie ? "Edit Movie" : "Add New Movie"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-md mb-6 ${
              message.includes("successfully")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter movie title"
              />
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Year *
              </label>
              <input
                id="year"
                name="year"
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 5}
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="director"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Director *
              </label>
              <input
                id="director"
                name="director"
                type="text"
                required
                value={formData.director}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter director name"
              />
            </div>

            <div>
              <label
                htmlFor="averageRating"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Average Rating
              </label>
              <input
                id="averageRating"
                name="averageRating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.averageRating}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter movie description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Genres * (comma separated)
              </label>
              <input
                id="genre"
                name="genre"
                type="text"
                required
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Action, Drama, Comedy"
              />
            </div>

            <div>
              <label
                htmlFor="cast"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cast * (comma separated)
              </label>
              <input
                id="cast"
                name="cast"
                type="text"
                required
                value={formData.cast}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Actor 1, Actor 2, Actor 3"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="trailerUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Trailer URL (optional)
            </label>
            <input
              id="trailerUrl"
              name="trailerUrl"
              type="url"
              value={formData.trailerUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/trailer.mp4"
            />
          </div>

          <div>
            <label
              htmlFor="poster"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Movie Poster {!movie && "*"}
            </label>
            <input
              id="poster"
              name="poster"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a movie poster image. Supported formats: JPG, PNG, WebP
            </p>
            {movie && movie.posterUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current poster:</p>
                <img
                  src={movie.posterUrl}
                  alt="Current poster"
                  className="mt-1 h-20 w-auto rounded border"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {movie ? "Updating..." : "Adding..."}
                </div>
              ) : movie ? (
                "Update Movie"
              ) : (
                "Add Movie"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
