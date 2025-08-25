import React from "react";

const Navbar = ({ user, onLogout, activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Movie Portal</h2>
            </div>

            {user.isAdmin && (
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    activeTab === "requests"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Requests
                </button>
                <button
                  onClick={() => setActiveTab("movies")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    activeTab === "movies"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Movies
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            {user.isAdmin && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Admin
              </span>
            )}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
