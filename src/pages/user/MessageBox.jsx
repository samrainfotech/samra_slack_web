import { useState, useEffect, useCallback, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FiPaperclip, FiX } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";

export default function ChannelMessages({ channel }) {
  const { user } = useAuth();
  const { socket, joinChannel, leaveChannel } = useSocket();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Ref for messages container
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!channel?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/messages/channel/${channel._id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err.response?.data || err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [channel?._id, BACKEND_URL, user?.token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ✅ Auto scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Socket real-time functionality
  useEffect(() => {
    if (socket && channel?._id) {
      console.log("Setting up socket listeners for channel:", channel._id);
      // Join channel room
      joinChannel(channel._id);

      // Listen for new messages
      const handleNewMessage = (message) => {
        console.log("Received new message:", message);
        setMessages(prev => [...prev, message]);
        // Show notification if message is not from current user
        if (message.sender?._id !== user?.id && message.sender?._id !== user?._id) {
          toast.success(`New message in #${channel.name}`, {
            duration: 3000,
            position: "top-right",
          });
        }
      };

      // Listen for message deletions
      const handleMessageDeleted = ({ messageId }) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      };

      // Listen for reactions
      const handleReactionAdded = (message) => {
        setMessages(prev => 
          prev.map(msg => msg._id === message._id ? message : msg)
        );
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("messageDeleted", handleMessageDeleted);
      socket.on("reactionAdded", handleReactionAdded);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("messageDeleted", handleMessageDeleted);
        socket.off("reactionAdded", handleReactionAdded);
        leaveChannel(channel._id);
      };
    }
  }, [socket, channel?._id, user?.id, user?._id, joinChannel, leaveChannel]);

  // Upload file to S3
  const uploadFile = async (file) => {
    const contentType = file.type || "application/octet-stream";
    const extension = file.name?.split(".").pop()?.toLowerCase();
    const { data } = await axios.get(
      `${BACKEND_URL}/uploads/workshop-image-post`,
      { params: { contentType, extension } }
    );
    const { url, fields, publicUrl } = data.data;
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    formData.append("file", file);
    const resp = await fetch(url, { method: "POST", body: formData });
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("S3 upload error:", errorText);
      throw new Error("File upload failed");
    }
    return publicUrl;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() && !selectedFile) return;
    try {
      let content = input;
      let type = "text";
      
      // Handle file upload if file is selected
      if (selectedFile) {
        setUploading(true);
        const fileUrl = await uploadFile(selectedFile);
        content = fileUrl;
        type = "file";
        setSelectedFile(null);
      }
      
      const payload = { type, content, channel: channel._id };
      const res = await axios.post(`${BACKEND_URL}/messages`, payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.data?.data) {
        // Don't fetch messages again - socket will handle real-time updates
        setInput("");
        setUploading(false);
      }
    } catch (err) {
      console.error("Error sending message:", err.response?.data || err.message);
      setUploading(false);
    }
  };

  // Format helpers
  const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const key = formatDate(msg.createdAt || msg.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">#{channel.name}</h2>
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600"
          >
            <FiUsers /> {channel.members?.length || 0}
          </button>
        </div>
        {channel.description && <p className="text-sm text-gray-500">{channel.description}</p>}
      </div>

      {/* Users */}
      {showUsers && (
        <div className="p-4 border-b bg-gray-50 text-sm space-y-1">
          {channel.members?.length ? (
            channel.members.map((m, i) => (
              <div key={i} className="text-gray-700">
                • {m.username || m.email || m.name || "Unknown User"}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No members in this channel.</p>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {loading ? (
          <p className="text-gray-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400">No messages yet. Start chatting 💬</p>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-4">
              {/* Date divider */}
              <div className="flex items-center justify-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {date}
                </span>
              </div>
              {msgs.map((msg) => {
                const isOwn = msg.sender?._id === user?.id || msg.sender?._id === user?._id;
                return (
                  <div
                    key={msg._id || msg.id}
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <span className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.sender?.username || msg.sender?.name || "Unknown"}
                    </span>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                        isOwn
                          ? "bg-green-600 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.type === "file" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-blue-400">
                            <FiPaperclip className="text-sm" />
                            <span className="text-xs">File attachment</span>
                          </div>
                          <a
                            href={msg.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-xs break-all"
                          >
                            {msg.content.split('/').pop()}
                          </a>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {formatTime(msg.createdAt || msg.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
        {/* 👇 Dummy div to always scroll to latest */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        {/* File preview */}
        {selectedFile && (
          <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiPaperclip className="text-gray-600" />
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-red-500"
            >
              <FiX />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="file-input"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
          >
            <FiPaperclip />
          </label>
          <button
            onClick={handleSend}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"
          >
            {uploading ? "..." : <AiOutlineSend />}
          </button>
        </div>
      </div>
    </div>
  );
}
