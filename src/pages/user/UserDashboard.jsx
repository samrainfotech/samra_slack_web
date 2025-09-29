import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreateChannel from "./CreateChannel";
import Channels from "./channels";
import ChannelMessages from "./MessageBox"; // ✅ Import messages component

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("createChannel");
  const [activeChannel, setActiveChannel] = useState(null); // ✅ Track selected channel

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2">⚡ User Panel</h2>
          <p className="text-sm text-gray-400">Slack Workspace</p>
        </div>

        <nav className="flex-1 px-0 py-0 flex flex-col">
          {/* Create Channel Button */}
          <div className="px-4 py-2">
            <button
              onClick={() => {
                setActiveTab("createChannel");
                setActiveChannel(null);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "createChannel"
                  ? "bg-indigo-600 text-white shadow"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              ➕ Create Channel
            </button>
          </div>

          {/* Channels list */}
          <div className="flex-1 overflow-hidden">
            <div className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              <Channels
                activeChannelId={activeChannel?._id}
                onSelectChannel={(ch) => {
                  setActiveChannel(ch);
                  setActiveTab("channelMessages");
                }}
              />
            </div>
          </div>
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center justify-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="mb-6">
          {activeTab === "createChannel" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                ➕ Create Channel
              </h1>
              <p className="text-gray-500">
                Add a new channel to collaborate with your team members.
              </p>
            </>
          ) : activeChannel ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                # {activeChannel.name}
              </h1>
              <p className="text-gray-500">{activeChannel.description}</p>
            </>
          ) : null}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow p-6 flex-1 flex flex-col">
          {activeTab === "createChannel" && <CreateChannel />}
          {activeTab === "channelMessages" && activeChannel && (
            <ChannelMessages channel={activeChannel} /> // ✅ Replaces placeholder
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
