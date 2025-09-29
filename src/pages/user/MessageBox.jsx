import { useState, useEffect, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function ChannelMessages({ channel }) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // ✅ Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Fetch messages for this channel
  useEffect(() => {
    if (!channel?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/channels/${channel._id}/messages`, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchMessages();
  }, [channel?._id, BACKEND_URL, user?.token]);

  // ✅ Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}/channels/${channel._id}/messages`,
        { text: newMessage },
        {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        }
      );

      setMessages([...messages, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 pb-3 mb-3">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          # {channel.name}
        </h2>
        <p className="text-sm text-gray-500">{channel.description || "Start chatting..."}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No messages yet. Start the conversation 🚀</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender?._id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow ${
                  msg.sender?._id === user?.id
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm font-medium">
                  {msg.sender?.username || "Unknown"}
                </p>
                <p>{msg.text}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="mt-4 flex items-center gap-2 border-t pt-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
        >
          <AiOutlineSend size={20} />
        </button>
      </div>
    </div>
  );
}
