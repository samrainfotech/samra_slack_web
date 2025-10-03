import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Channels from "./Channels"; // Channel list
import ChannelMessages from "./MessageBox"; // Messages component
import { FiMenu, FiX } from "react-icons/fi";

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0); // trigger sidebar reload
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out");
  };

  // force sidebar refresh
  const refreshChannels = () => setRefreshFlag((prev) => prev + 1);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar (Desktop + Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 transform 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          w-64 bg-gray-900 text-white flex flex-col z-40 
          transition-transform duration-300 ease-in-out 
          md:relative md:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">⚡ User Panel</h2>
            <p className="text-sm text-gray-400">Slack Workspace</p>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto">
          <Channels
            key={refreshFlag} // re-render on refresh
            activeChannelId={activeChannel?._id}
            onSelectChannel={(ch) => {
              setActiveChannel(ch);
              setSidebarOpen(false); // close on mobile when selecting
            }}
          />
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            <FiMenu size={24} />
          </button>
          <h2 className="font-bold text-lg">Slack Workspace</h2>
        </div>

        {/* Chat area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeChannel ? (
            <ChannelMessages channel={activeChannel} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a channel to start chatting 💬
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
