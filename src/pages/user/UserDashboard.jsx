import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Channels from "./ChannelList";
import ChannelMessages from "./MessageBox";
import UserMessageBox from "./UserMessageBox";
import Workshop from "./CreateWorkshop";
import Navbar from "../../components/Navbar"; 
import { useSocket } from "../../context/SocketContext";
import { FiMenu, FiX, FiPlusCircle, FiMessageCircle } from "react-icons/fi";
import axios from "axios";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { notifications, setNotifications, joinPrivateChat } = useSocket();


  const [activeChannel, setActiveChannel] = useState(null);
  const [activePrivate, setActivePrivate] = useState(null);
  const [showWorkshop, setShowWorkshop] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // 🔹 Logout handler
  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged Out");
  };

  // 🔹 Refresh channels
  const refreshChannels = () => setRefreshFlag((prev) => prev + 1);

  // 🔹 Show Create Workshop
  const handleShowWorkshop = () => {
    setActiveChannel(null);
    setActivePrivate(null);
    setShowWorkshop(true);
    setSidebarOpen(false);
  };

  // 🔹 Fetch all users for private chat
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/users`, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });
        const allUsers = res.data?.users || res.data?.data || [];
        setUsers(allUsers.filter((u) => u._id !== user?._id));
        allUsers.forEach((u => joinPrivateChat(u._id))); 
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    if (user?._id) fetchUsers();
  }, [BACKEND_URL, user?._id, user?.token]);
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* ✅ Top Navbar */}
      <Navbar
  onMenuClick={() => setSidebarOpen(true)}
  sidebarOpen={sidebarOpen}
  notifications={notifications}
  setNotifications={setNotifications}
/>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    w-1/2 md:w-64 bg-gray-900 text-white flex flex-col z-40 
    transition-transform duration-300 ease-in-out 
    md:relative md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">⚡ User Panel</h2>
            <p className="text-sm text-gray-400">Slack Workspace</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Channels Section */}
        <div className="flex-1 border-b border-gray-800">
          <h3 className="px-4 pt-3 pb-2 text-gray-400 text-xs uppercase font-semibold tracking-wide">
            Channels
          </h3>
          <div className="max-h-56 overflow-y-auto hide-scrollbar">
            <Channels
              key={refreshFlag}
              activeChannelId={activeChannel?._id}
              onSelectChannel={(ch) => {
                setActiveChannel(ch);
                setActivePrivate(null);
                setShowWorkshop(false);
                setSidebarOpen(false);
              }}
            />
          </div>
        </div>

        {/* Private Chats Section */}
        <div className="flex-1 border-b border-gray-800">
          <h3 className="px-4 pt-3 pb-2 text-gray-400 text-xs uppercase font-semibold tracking-wide flex items-center gap-2">
            <FiMessageCircle size={14} />
            Private Chats
          </h3>
          <div className="max-h-56 overflow-y-auto hide-scrollbar">
            {users.length > 0 ? (
              users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => {
                    setActivePrivate(u);
                    setActiveChannel(null);
                    setShowWorkshop(false);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors ${
                    activePrivate?._id === u._id ? "bg-gray-800" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {u.username?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <span className="truncate">
                      {u.username || "Unnamed User"}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="px-4 py-2 text-gray-500 text-sm">No users found</p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          {user?.team === "sales" && (
            <button
              onClick={handleShowWorkshop}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
            >
              <FiPlusCircle size={18} />
              Add Workshop
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative pt-16 md:pt-20">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {showWorkshop ? (
            <Workshop />
          ) : activeChannel ? (
            <ChannelMessages channel={activeChannel} />
          ) : activePrivate ? (
            <UserMessageBox selectedUser={activePrivate} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a channel or user to start chatting 💬
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
