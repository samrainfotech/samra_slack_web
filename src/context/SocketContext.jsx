import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import jwtDecode from "jwt-decode"; // ✅ correct import

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const activeChatRef = useRef(null); // 👈 track currently opened private chat
  const { user, logout } = useAuth();

  // 🔒 Token validation — auto logout if invalid or expired
  useEffect(() => {
    if (!user?.token) return;
    try {
      const decoded = jwtDecode(user.token);
      if (decoded.exp * 1000 < Date.now()) {
        toast.error("Session expired. Please log in again.");
        logout();
      }
    } catch {
      toast.error("Invalid token. Please log in again.");
      logout();
    }
  }, [user?.token]);

  // 🔌 Initialize socket
  useEffect(() => {
    if (!user?.token || !user?._id) return;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const socketUrl = BACKEND_URL.replace("/api", "");

    const newSocket = io(socketUrl, {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("join", user._id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    // 📢 CHANNEL MESSAGES
    newSocket.on("newMessage", (message) => {
      const senderId = message.sender?._id || message.sender;
      if (senderId === user._id) return;

      toast.success(`💬 New message in ${message.channel?.name || "a channel"}`);
      setNotifications((prev) => [
        {
          type: "channel",
          text: `💬 New message in ${message.channel?.name || "channel"}`,
          sender: message.sender?.username || "Someone",
          content: message.content,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // 💬 PRIVATE MESSAGE (received in real time)
    newSocket.on("newPrivateMessage", (message) => {
      const senderId = message.sender?._id || message.sender;
      const receiverId = message.receiver?._id || message.receiver;

      // If we are the receiver but not currently chatting with the sender → show toast
      if (receiverId === user._id && activeChatRef.current !== senderId) {
        toast(`📩 New message from ${message.sender?.name || message.sender?.username || "User"}`);
        setNotifications((prev) => [
          {
            type: "private",
            text: `📩 Message from ${message.sender?.name || message.sender?.username || "User"}`,
            sender: message.sender?.username || "User",
            content: message.content,
            time: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });

    // 🔔 PRIVATE NOTIFICATION (user not in that chat)
    newSocket.on("newPrivateNotification", (payload) => {
      // Example payload: { from: { _id, name, username }, content }
      const senderName = payload?.from?.name || payload?.from?.username || "Someone";

      // ✅ Show only if we're not currently chatting with that sender
      if (activeChatRef.current !== payload?.from?._id) {
        toast(`📨 ${senderName} sent you a message`);
        setNotifications((prev) => [
          {
            type: "private",
            text: `📨 ${senderName} sent you a message`,
            sender: senderName,
            content: payload?.content || "",
            time: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });

    // 🧹 Cleanup
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, user?.token]);

  // 🧭 Helper: Join / Leave Channel or Private Chat
  const joinChannel = (channelId) => socket?.emit("joinChannel", channelId);
  const leaveChannel = (channelId) => socket?.emit("leaveChannel", channelId);

  const joinPrivateChat = (targetId) => {
    if (!user?._id || !targetId) return;
    activeChatRef.current = targetId;
    socket?.emit("joinPrivateChat", { userId: user._id, targetId });
  };

  const leavePrivateChat = (targetId) => {
    if (!user?._id || !targetId) return;
    if (activeChatRef.current === targetId) activeChatRef.current = null;
    socket?.emit("leavePrivateChat", { userId: user._id, targetId });
  };

  const value = {
    socket,
    isConnected,
    notifications,
    setNotifications,
    joinChannel,
    leaveChannel,
    joinPrivateChat,
    leavePrivateChat,
    activeChatRef,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
