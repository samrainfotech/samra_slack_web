import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddEmployee from "./AddEmployee";
import UserList from "./UserList";
import CreateChannel from "./CreateChannel";
import ChannelList from "./ChannelList"; // ⬅ Import channel list
import {
  FiUsers,
  FiUserPlus,
  FiLogOut,
  FiMenu,
  FiPlusSquare,
  FiList,
} from "react-icons/fi";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out");
  };

  return (
    <div className="flex h-screen bg-gray-100 font-['Montserrat']">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300
        w-64 bg-[#1d1f23] text-white shadow-xl z-20 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">⚡ Admin Panel</h2>
          <p className="text-sm text-gray-400">Slack Management</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* User List */}
          <button
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <FiUsers /> User List
          </button>

          {/* Add Employee */}
          <button
            onClick={() => {
              setActiveTab("add");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "add"
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <FiUserPlus /> Add Employee
          </button>

          {/* Create Channel */}
          <button
            onClick={() => {
              setActiveTab("channel");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "channel"
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <FiPlusSquare /> Create Channel
          </button>

          {/* Channel List */}
          <button
            onClick={() => {
              setActiveTab("channellist");
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "channellist"
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <FiList /> Channel List
          </button>
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        className="md:hidden absolute top-4 left-4 text-2xl text-gray-700 z-30"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FiMenu />
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {activeTab === "users"
              ? " All Users"
              : activeTab === "add"
              ? " Add Employee"
              : activeTab === "channel"
              ? " Create Channel"
              : " Channel List"}
          </h1>
          <p className="text-gray-500">
            Manage your Slack-like workspace efficiently
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {activeTab === "users" && <UserList />}
          {activeTab === "add" && <AddEmployee />}
          {activeTab === "channel" && <CreateChannel />}
          {activeTab === "channellist" && <ChannelList />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
