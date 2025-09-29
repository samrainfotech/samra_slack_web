import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Channels from './channels';

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0); //  trigger channel reload

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged Out');
  };

  //  force sidebar refresh
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
          {/* Channels list */}
          <div className="flex-1 overflow-hidden">
            <Channels
              key={refreshFlag} //  re-render on refresh
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
    </div>
  );
};


export default UserDashboard;
