import { useState, useEffect, useCallback, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FiPaperclip, FiX } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";

export default function UserMessageBox({ selectedUser }) {
  const { user, logout } = useAuth();
  const { socket, joinPrivateChat, leavePrivateChat } = useSocket();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch existing messages
  const fetchMessages = useCallback(async () => {
    if (!selectedUser?._id || !user?.token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/chat/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(res.data?.messages || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
      } else {
        console.error("Error fetching private messages:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, selectedUser?._id, user?.token, logout]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => scrollToBottom(), [messages]);

  // Socket listener setup
  useEffect(() => {
    if (!socket || !selectedUser?._id || !user?._id) return;

    joinPrivateChat(selectedUser._id);

    const handleNewPrivateMessage = (message) => {
      if (!message?.sender || !message?.receiver) return;
      const ids = [message.sender._id || message.sender, message.receiver._id || message.receiver];
      const current = [user._id, selectedUser._id];
      if (ids.sort().join("_") === current.sort().join("_")) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newPrivateMessage", handleNewPrivateMessage);

    return () => {
      leavePrivateChat(selectedUser._id);
      socket.off("newPrivateMessage", handleNewPrivateMessage);
    };
  }, [socket, selectedUser?._id, user?._id, joinPrivateChat, leavePrivateChat]);

  // --- ⬇️ Upload image to AWS S3 using presigned POST ---
  const uploadFile = async (file) => {
    try {
      const contentType = file.type;
      const extension = file.name.split(".").pop();

      // Step 1: Get presigned URL and fields
      const res = await axios.get(`${BACKEND_URL}/uploads/workshop-image-post`, {
        params: { contentType, extension },
      });

      const { url, fields, publicUrl } = res.data.data;
      if (!url || !fields || !publicUrl) {
        throw new Error("Invalid upload configuration");
      }

      // Step 2: Upload file to S3
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
      formData.append("file", file);

      const uploadResponse = await fetch(url, { method: "POST", body: formData });
      if (!uploadResponse.ok) throw new Error("Failed to upload image to S3");

      return publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
      throw err;
    }
  };

  // --- ⬇️ Send message handler (text + image) ---
  const handleSend = async () => {
    if (!user?.token) {
      toast.error("Please login to send messages");
      return logout();
    }
    if ((!input.trim() && !selectedFile) || !selectedUser?._id) return;

    try {
      let content = input.trim();
      let type = "text";

      if (selectedFile) {
        setUploading(true);
        content = await uploadFile(selectedFile);
        type = "image"; // 👈 important: use "image" type
        setSelectedFile(null);
        setUploading(false);
      }

      const res = await axios.post(
        `${BACKEND_URL}/chat`,
        { receiverId: selectedUser._id, type, content },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const created = res?.data?.data || res?.data?.message || res?.data;
      if (created) {
        const exists = messages.some((m) => m._id === created._id || m.id === created.id);
        if (!exists) setMessages((prev) => [...prev, created]);
      }

      setInput("");
    } catch (err) {
      console.error("Send message error:", err);
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        logout();
      } else {
        toast.error("Failed to send message");
      }
      setUploading(false);
    }
  };

  const formatTime = (d) =>
    d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg">
          💬 Chat with {selectedUser?.username || selectedUser?.name || "User"}
        </h2>
      </div>

      {/* Messages list */}
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
                  {msg.type === "image" ? (
                    <img
                      src={msg.content}
                      alt="uploaded"
                      className="max-w-[200px] max-h-[200px] rounded-lg"
                    />
                  ) : (
                    msg.content
                  )}
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

      {/* Input area */}
      <div className="p-4 border-t">
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
            id="file-input-private"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            accept="image/*"
          />
          <label
            htmlFor="file-input-private"
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
