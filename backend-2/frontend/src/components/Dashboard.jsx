import React, { useState } from "react";
import Navbar from "./Navbar";
import RequestsTab from "./RequestsTab";
import MoviesTab from "./MoviesTab";

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.email}
          </h1>
          <p className="text-gray-600 mt-2">
            {user.isAdmin
              ? "Admin Dashboard - Manage requests and movies"
              : "User Dashboard"}
          </p>
        </div>

        {activeTab === "requests" && <RequestsTab user={user} />}
        {activeTab === "movies" && <MoviesTab user={user} />}
      </main>
    </div>
  );
};

export default Dashboard;
