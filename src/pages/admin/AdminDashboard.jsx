import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AddEmployee from "./AddEmployee";
import UserList from "./UserList";
import CreateChannel from "./CreateChannel";
import ChannelList from "./ChannelList";
import Navbar from "../../components/Navbar";
import {
  FiUsers,
  FiUserPlus,
  FiLogOut,
  FiPlusSquare,
  FiList,
  FiX,
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
    <div className="h-screen bg-gray-100 font-['Montserrat'] overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar + Main layout */}
      <div className="flex h-full">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 transform 
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 transition-transform duration-300
            w-64 bg-[#1d1f23] text-white shadow-xl z-20 flex flex-col`}
        >
          <div className="p-6 border-b border-gray-700 flex justify-between items-center mt-16 md:mt-0">
            <div>
              <h2 className="text-xl font-bold">⚡ Admin Panel</h2>
              <p className="text-sm text-gray-400">Slack Management</p>
            </div>
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={22} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { key: "users", label: "User List", icon: <FiUsers /> },
              { key: "add", label: "Add Employee", icon: <FiUserPlus /> },
              { key: "channel", label: "Create Channel", icon: <FiPlusSquare /> },
              { key: "channellist", label: "Channel List", icon: <FiList /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === key
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
       <main
          className={`flex-1 transition-all duration-300 px-4 md:px-10 pt-24 md:pt-20`}
        >

          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
            {activeTab === "users" && <UserList />}
            {activeTab === "add" && <AddEmployee />}
            {activeTab === "channel" && <CreateChannel />}
            {activeTab === "channellist" && <ChannelList />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
