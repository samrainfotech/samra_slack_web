import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CreateChannel from "./CreateChannel";
import Channels from "./channels";
import ChannelMessages from "./MessageBox"; // ✅ Import messages component
import UpdateChannel from "./UpdateChannel"; // ✅ Import update channel component

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("createChannel");
  const [activeChannel, setActiveChannel] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0); // 🔄 trigger channel reload

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out");
  };

  // 🔄 force sidebar refresh
  const refreshChannels = () => setRefreshFlag((prev) => prev + 1);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">⚡ User Panel</h2>
          <p className="text-sm text-gray-400">Slack Workspace</p>
        </div>

        <nav className="flex-1">
          {/* Create Channel Button */}
          <div className="px-4 py-2">
            <button
              onClick={() => {
                setActiveTab("createChannel");
                setActiveChannel(null);
              }}
              className={`w-full px-4 py-2 rounded-lg font-medium transition ${
                activeTab === "createChannel"
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              ➕ Create Channel
            </button>
          </div>

          {/* Channels list */}
          <div className="flex-1 overflow-hidden">
            <Channels
              key={refreshFlag} // 🔄 re-render on refresh
              activeChannelId={activeChannel?._id}
              onSelectChannel={(ch) => {
                setActiveChannel(ch);
                setActiveTab("channelMessages");
              }}
              onEditChannel={(ch) => {
                setActiveChannel(ch);
                setActiveTab("editChannel");
              }}
            />
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6">
          {activeTab === "createChannel" && (
            <>
              <h1 className="text-3xl font-bold">➕ Create Channel</h1>
              <p className="text-gray-500">
                Add a new channel to collaborate with your team members.
              </p>
            </>
          )}
          {activeChannel && activeTab !== "createChannel" && (
            <>
              <h1 className="text-3xl font-bold"># {activeChannel.name}</h1>
              <p className="text-gray-500">{activeChannel.description}</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          {activeTab === "createChannel" && (
            <CreateChannel onChannelCreated={refreshChannels} />
          )}
          {activeTab === "channelMessages" && activeChannel && (
            <ChannelMessages channel={activeChannel} />
          )}
          {activeTab === "editChannel" && activeChannel && (
            <UpdateChannel
              channel={activeChannel}
              onChannelUpdated={refreshChannels}
            />
          )}
        </div>
      </main>
    </div>
  );
};


export default UserDashboard;
