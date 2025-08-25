import React from "react";

const MovieCard = ({ movie, onEdit, onDelete }) => {
  const handleImageError = (e) => {
    e.target.src =
      "https://via.placeholder.com/300x450/374151/ffffff?text=No+Image";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={
            movie.posterUrl ||
            "https://via.placeholder.com/300x450/374151/ffffff?text=No+Image"
          }
          alt={movie.title}
          onError={handleImageError}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          ⭐ {movie.averageRating}/10
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {movie.title}
          </h3>
          <span className="text-sm text-gray-500 ml-2">{movie.year}</span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {movie.description}
        </p>

        <div className="mb-3">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Director:</span> {movie.director}
          </p>
        </div>

        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {movie.genre.map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Cast:</span> {movie.cast.join(", ")}
          </p>
        </div>

        {movie.trailerUrl && (
          <div className="mb-4">
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              🎬 Watch Trailer
            </a>
          </div>
        )}

        {(onEdit || onDelete) && (
          <div className="flex space-x-2 pt-3 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={() => onEdit(movie)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-200"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(movie._id)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
