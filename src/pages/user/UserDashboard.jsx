import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChannel } from '../../context/ChannelContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { logout, user } = useAuth();
  const {
    channels,
    currentChannel,
    setCurrentChannel,
    startPrivateChat,
    createChannel,
    loading,
  } = useChannel();
  const navigate = useNavigate();
  const [newMsg, setNewMsg] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');

  // Mock contacts for direct messaging (you can replace this with real users from your backend)
  const contacts = [
    { _id: 'user2', name: 'John Doe', online: true, unread: 2 },
    { _id: 'user3', name: 'Jane Smith', online: true, unread: 0 },
    { _id: 'user4', name: 'Mike Johnson', online: false, unread: 1 },
  ];

  // Mock messages (you'll need to implement real message service)
  const [messages, setMessages] = useState({});

  useEffect(() => {
    // Set first channel as active when channels load
    if (channels.length > 0 && !currentChannel) {
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel, setCurrentChannel]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged Out');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    // Here you would send the message to your backend
    // For now, we'll just update the local state
    if (currentChannel) {
      const newMessage = {
        id: Date.now(),
        text: newMsg,
        sender: 'You',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMe: true,
      };

      setMessages((prev) => ({
        ...prev,
        [currentChannel._id]: [...(prev[currentChannel._id] || []), newMessage],
      }));
    }

    setNewMsg('');
  };

  const handleStartPrivateChat = async (contact) => {
    try {
      const privateChat = await startPrivateChat(user._id, contact._id);
      setCurrentChannel(privateChat);
      toast.success(`Started chat with ${contact.name}`);
    } catch (error) {
      toast.error('Failed to start private chat');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await createChannel({
        name: newChannelName,
        description: newChannelDesc,
        createdBy: user._id,
        type: 'channel',
      });

      setNewChannelName('');
      setNewChannelDesc('');
      setShowCreateChannel(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const getAvatarColor = (name) => {
    const colors = {
      'John Doe': 'bg-blue-500',
      'Jane Smith': 'bg-green-500',
      'Mike Johnson': 'bg-purple-500',
      You: 'bg-gray-600',
    };
    return colors[name] || 'bg-gray-400';
  };

  const getChannelMessages = (channelId) => {
    return messages[channelId] || [];
  };

  return (
    <div className="h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-80 bg-white flex flex-col shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ChatApp
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome, {user?.name || 'User'}! 👋
          </p>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              📢 Channels
            </h2>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="text-blue-500 hover:text-blue-700 text-lg"
              title="Create Channel"
            >
              +
            </button>
          </div>

          {showCreateChannel && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <form onSubmit={handleCreateChannel}>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="w-full mb-2 p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full mb-2 p-2 border rounded"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-1 rounded"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateChannel(false)}
                    className="flex-1 bg-gray-500 text-white py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <ul className="space-y-3">
            {loading ? (
              <li className="text-gray-500">Loading channels...</li>
            ) : (
              channels
                .filter((channel) => channel.type === 'channel')
                .map((channel) => (
                  <li
                    key={channel._id}
                    onClick={() => setCurrentChannel(channel)}
                    className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentChannel?._id === channel._id
                        ? 'bg-blue-50 border border-blue-200 shadow-sm'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-gray-400 mr-3 text-lg">#</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-700 font-medium truncate block">
                        {channel.name}
                      </span>
                      {channel.description && (
                        <span className="text-gray-500 text-sm truncate block">
                          {channel.description}
                        </span>
                      )}
                    </div>
                  </li>
                ))
            )}
          </ul>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            💬 Direct Messages
          </h2>
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li
                key={contact._id}
                onClick={() => handleStartPrivateChat(contact)}
                className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentChannel?.type === 'private' &&
                  currentChannel?.members?.includes(contact._id)
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(
                      contact.name
                    )}`}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      contact.online ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg truncate">
                      {contact.name}
                    </span>
                    {contact.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate mt-1">
                    Click to start conversation...
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 font-semibold text-lg shadow-md"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChannel ? (
          <>
            <div className="bg-white border-b border-gray-200 p-6 shadow-sm flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  currentChannel.type === 'private'
                    ? 'bg-purple-500'
                    : 'bg-blue-500'
                }`}
              >
                {currentChannel.type === 'private' ? '👤' : '#'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentChannel.type === 'private'
                    ? 'Private Chat'
                    : currentChannel.name}
                </h2>
                <span className="text-gray-500 text-sm">
                  {currentChannel.type === 'channel'
                    ? `${currentChannel.members?.length || 0} members`
                    : 'Direct message'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="space-y-6 max-w-4xl mx-auto">
                {getChannelMessages(currentChannel._id).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isMe ? 'justify-end' : 'justify-start'
                    } items-start space-x-4`}
                  >
                    {!msg.isMe && (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(
                          msg.sender
                        )}`}
                      >
                        {msg.sender.charAt(0)}
                      </div>
                    )}
                    <div className="max-w-[70%]">
                      {!msg.isMe && (
                        <span className="text-sm font-semibold text-gray-700">
                          {msg.sender}
                        </span>
                      )}
                      <div
                        className={`px-6 py-4 rounded-2xl ${
                          msg.isMe
                            ? 'bg-blue-500 text-white ml-auto'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                      </div>
                      <span
                        className={`text-xs mt-1 block ${
                          msg.isMe
                            ? 'text-blue-300 text-right'
                            : 'text-gray-500 text-left'
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                    {msg.isMe && (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(
                          'You'
                        )}`}
                      >
                        Y
                      </div>
                    )}
                  </div>
                ))}

                {getChannelMessages(currentChannel._id).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 p-6 shadow-lg">
              <form
                onSubmit={handleSend}
                className="max-w-4xl mx-auto flex space-x-4"
              >
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={`Type your message...`}
                  className="flex-1 border border-gray-300 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 font-semibold text-lg"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">
                Welcome to ChatApp
              </h2>
              <p className="text-gray-500">
                Select a channel or start a direct message to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
