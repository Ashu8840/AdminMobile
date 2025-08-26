import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DashboardHome from "./DashboardHome";
import UserManagement from "./UserManagement";
import BlogModeration from "./BlogModeration";
import ReviewModeration from "./ReviewModeration";
import CommentModeration from "./CommentModeration";
import Analytics from "./Analytics";

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden admin-content">
        {/* Header */}
        <Header
          user={user}
          onLogout={onLogout}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/blogs" element={<BlogModeration />} />
            <Route path="/reviews" element={<ReviewModeration />} />
            <Route path="/comments" element={<CommentModeration />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
