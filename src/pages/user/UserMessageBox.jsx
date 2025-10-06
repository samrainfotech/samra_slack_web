import { useState, useEffect, useCallback, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function UserMessageBox({ selectedUser }) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ------------------------
  // Scroll to bottom
  // ------------------------
  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // ------------------------
  // Fetch private messages between current user and selectedUser
  // ------------------------
  const fetchMessages = useCallback(async () => {
    if (!selectedUser?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/chat/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error("Error fetching private messages:", err);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, selectedUser?._id, user?.token]);

  // ------------------------
  // Fetch messages on user change
  // ------------------------
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ------------------------
  // Auto scroll on message updates
  // ------------------------
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ------------------------
  // Send message
  // ------------------------
  const handleSend = async () => {
    if (!input.trim() || !selectedUser?._id) return;
    try {
      const payload = {
        receiverId: selectedUser._id, // ✅ matches backend receiver key
        type: "text",
        content: input.trim(),
      };

      await axios.post(`${BACKEND_URL}/chat`, payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      setInput("");
      await fetchMessages(); // ✅ refresh manually since sockets removed
    } catch (err) {
      console.error("Error sending private message:", err);
    }
  };

  // ------------------------
  // Format time helper
  // ------------------------
  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2">
          💬 Chat with {selectedUser.username || selectedUser.name || "User"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-gray-400">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400">No messages yet. Start chatting 💬</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
              >
                <span className="text-xs font-semibold text-gray-600 mb-1">
                  {msg.sender?.username || msg.sender?.name || "Unknown"}
                </span>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm ${
                    isOwn
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <AiOutlineSend />
        </button>
      </div>
    </div>
  );
}
