import React from "react";
import { Menu, LogOut, User } from "lucide-react";
import toast from "react-hot-toast";

const Header = ({ user, onLogout, onSidebarToggle }) => {
  const handleLogout = () => {
    onLogout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">
            Movie Platform Admin
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-gray-400 bg-gray-200 rounded-full p-1" />
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="admin-button admin-button-danger flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
