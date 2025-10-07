import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Channels from './channels';
import ChannelMessages from './MessageBox';
import UpdateChannel from './UpdateChannel';

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [activeTab, setActiveTab] = useState('channelMessages'); // <-- added missing state

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged Out');
  };

  const refreshChannels = () => setRefreshFlag((prev) => prev + 1);

  // ✅ Component return should be here
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">⚡ User Panel</h2>
          <p className="text-sm text-gray-400">Slack Workspace</p>
        </div>

        <nav className="flex-1">
          {/* Channels list */}
          <div className="flex-1 overflow-hidden">
            <Channels
              key={refreshFlag}
              activeChannelId={activeChannel?._id}
              onSelectChannel={(ch) => {
                setActiveChannel(ch);
                setActiveTab('channelMessages');
              }}
              onEditChannel={(ch) => {
                setActiveChannel(ch);
                setActiveTab('editChannel');
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
            Logout
          </button>
        </div>
      </aside>

      {/* ✅ Main area — show messages or update channel */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'channelMessages' && activeChannel && (
          <ChannelMessages channel={activeChannel} />
        )}
        {activeTab === 'editChannel' && activeChannel && (
          <UpdateChannel channel={activeChannel} onUpdated={refreshChannels} />
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
