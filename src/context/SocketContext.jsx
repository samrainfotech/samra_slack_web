// import { createContext, useContext, useEffect, useState, useRef } from "react";
// import { io } from "socket.io-client";
// import { useAuth } from "./AuthContext";
// import toast from "react-hot-toast";
// import jwtDecode from "jwt-decode";

// const SocketContext = createContext();

// export const useSocket = () => {
//   const ctx = useContext(SocketContext);
//   if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
//   return ctx;
// };

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [notifications, setNotifications] = useState([]);

//   const activeChatRef = useRef(null); // currently open private chat
//   const activeChannelRef = useRef(null); // currently open channel

//   const { user, logout } = useAuth();

//   // ✅ Token validation
//   useEffect(() => {
//     if (!user?.token) return;
//     try {
//       const decoded = jwtDecode(user.token);
//       if (decoded.exp * 1000 < Date.now()) {
//         toast.error("Session expired. Please log in again.");
//         logout();
//       }
//     } catch {
//       toast.error("Invalid token. Please log in again.");
//       logout();
//     }
//   }, [user?.token]);

//   // ✅ Connect socket when logged in
//   useEffect(() => {
//     if (!user?._id || !user?.token) return;

//     const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
//     const socketUrl = BACKEND_URL.replace("/api", "");

//     const newSocket = io(socketUrl, {
//       auth: { token: user.token },
//       transports: ["websocket", "polling"],
//       reconnection: true,
//     });

//     newSocket.on("connect", () => {
//       console.log("🟢 Socket connected:", newSocket.id);
//       setIsConnected(true);
//       newSocket.emit("join", user._id);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("🔴 Socket disconnected");
//       setIsConnected(false);
//     });

//     // ✅ CHANNEL MESSAGE HANDLER
//     newSocket.on("newMessage", (message) => {
//       const senderId = message.sender?._id || message.sender;
//       const channelId = message.channel?._id || message.channel;

//       // Skip if message is from self
//       if (senderId === user._id) return;

//       // Skip if currently in that channel
//       if (activeChannelRef.current === channelId) {
//         console.log("📨 Message ignored (active channel)");
//         return;
//       }

//       // ✅ Show channel notification
//       console.log("🔔 Channel notification triggered");
//       toast.success(`💬 New message in ${message.channel?.name || "a channel"}`);
//       setNotifications((prev) => [
//         {
//           type: "channel",
//           text: `💬 New message in ${message.channel?.name || "a channel"}`,
//           sender: message.sender?.username || "User",
//           content: message.content,
//           time: new Date().toISOString(),
//         },
//         ...prev,
//       ]);
//     });

//     // ✅ PRIVATE MESSAGE HANDLER
//     newSocket.on("newPrivateMessage", (message) => {
//       const senderId = message.sender?._id || message.sender;

//       // Skip if message is from self
//       if (senderId === user._id) return;

//       // Skip if currently chatting with that user
//       if (activeChatRef.current === senderId) {
//         console.log("📨 Message ignored (active private chat)");
//         return;
//       }

//       // ✅ Show private chat notification
//       console.log("🔔 Private chat notification triggered");
//       toast(`📩 New message from ${message.sender?.name || "User"}`);
//       setNotifications((prev) => [
//         {
//           type: "private",
//           text: `📩 Message from ${message.sender?.name || "User"}`,
//           sender: message.sender?.username || "User",
//           content: message.content,
//           time: new Date().toISOString(),
//         },
//         ...prev,
//       ]);
//     });

//     setSocket(newSocket);
//     return () => {
//       newSocket.disconnect();
//     };
//   }, [user?._id, user?.token]);

//   // ✅ Utility functions for chat/channel management
//   const joinChannel = (channelId) => {
//     if (!socket) return;
//     activeChatRef.current = null; // clear private chat
//     activeChannelRef.current = channelId;
//     socket.emit("joinChannel", channelId);
//     console.log("✅ Joined channel:", channelId);
//   };

//   const leaveChannel = (channelId) => {
//     if (!socket) return;
//     if (activeChannelRef.current === channelId) activeChannelRef.current = null;
//     socket.emit("leaveChannel", channelId);
//     console.log("🚪 Left channel:", channelId);
//   };

//   const joinPrivateChat = (targetId) => {
//     if (!socket) return;
//     activeChannelRef.current = null; // clear active channel
//     activeChatRef.current = targetId;
//     socket.emit("joinPrivateChat", { userId: user._id, targetId });
//     console.log("💬 Joined private chat with:", targetId);
//   };

//   const leavePrivateChat = (targetId) => {
//     if (!socket) return;
//     if (activeChatRef.current === targetId) activeChatRef.current = null;
//     socket.emit("leavePrivateChat", { userId: user._id, targetId });
//     console.log("🚪 Left private chat:", targetId);
//   };

//   return (
//     <SocketContext.Provider
//       value={{
//         socket,
//         isConnected,
//         notifications,
//         setNotifications,
//         joinChannel,
//         leaveChannel,
//         joinPrivateChat,
//         leavePrivateChat,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import jwtDecode from "jwt-decode";

const SocketContext = createContext();

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const activeChatRef = useRef(null); // currently open private chat
  const activeChannelRef = useRef(null); // currently open channel

  const { user, logout } = useAuth();

  // ✅ Token validation
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

  // ✅ Connect socket when logged in
  useEffect(() => {
    if (!user?._id || !user?.token) return;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const socketUrl = BACKEND_URL.replace("/api", "");

    const newSocket = io(socketUrl, {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    // ------------------------
    // Connection events
    // ------------------------
    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("join", user._id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    // ------------------------
    // ✅ CHANNEL MESSAGE HANDLER
    // ------------------------
    newSocket.on("newMessage", (message) => {
      const senderId = message.sender?._id || message.sender;
      const channelId = message.channel?._id || message.channel;

      // Skip if message is from self
      if (senderId === user._id) return;

      // Skip if currently in that channel
      if (activeChannelRef.current === channelId) {
        console.log("📨 Message ignored (active channel)");
        return;
      }

      // ✅ Show channel notification
      console.log("🔔 Channel notification triggered");
      toast.success(`💬 New message in ${message.channel?.name || "a channel"}`);
      setNotifications((prev) => [
        {
          type: "channel",
          text: `💬 New message in ${message.channel?.name || "a channel"}`,
          sender: message.sender?.username || "User",
          content: message.content,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // ------------------------
    // ✅ PRIVATE CHAT MESSAGE HANDLER (for active private chat)
    // ------------------------
    newSocket.on("newPrivateMessage", (message) => {
      const senderId = message.sender?._id || message.sender;

      // Skip if message is from self
      if (senderId === user._id) return;

      // Skip if currently chatting with that user
      if (activeChatRef.current === senderId) {
        console.log("📨 Message ignored (active private chat)");
        return;
      }

      // ✅ Show private chat notification
      console.log("🔔 Private chat message notification triggered");
      toast(`📩 New message from ${message.sender?.name || "User"}`);
      setNotifications((prev) => [
        {
          type: "private",
          text: `📩 Message from ${message.sender?.name || "User"}`,
          sender: message.sender?.username || "User",
          content: message.content,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // ------------------------
    // ✅ PRIVATE CHAT NOTIFICATION HANDLER (for inactive chats)
    // ------------------------
    newSocket.on("newPrivateNotification", (notification) => {
      const sender = notification.from;
      const senderId = sender?._id || sender;

      // Skip if self
      if (senderId === user._id) return;

      // Skip if currently chatting with that user
      if (activeChatRef.current === senderId) {
        console.log("📨 Private notification ignored (active chat)");
        return;
      }

      console.log("🔔 Private notification received");
      toast(`📩 New message from ${sender?.name || "User"}`);
      setNotifications((prev) => [
        {
          type: "private",
          text: `📩 Message from ${sender?.name || "User"}`,
          sender: sender?.username || "User",
          content: notification.content,
          time: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // ------------------------
    // Cleanup
    // ------------------------
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, user?.token]);

  // ------------------------
  // ✅ Utility functions for chat/channel management
  // ------------------------
  const joinChannel = (channelId) => {
    if (!socket) return;
    activeChatRef.current = null; // clear private chat
    activeChannelRef.current = channelId;
    socket.emit("joinChannel", channelId);
    console.log("✅ Joined channel:", channelId);
  };

  const leaveChannel = (channelId) => {
    if (!socket) return;
    if (activeChannelRef.current === channelId) activeChannelRef.current = null;
    socket.emit("leaveChannel", channelId);
    console.log("🚪 Left channel:", channelId);
  };

  const joinPrivateChat = (targetId) => {
    if (!socket) return;
    activeChannelRef.current = null; // clear active channel
    activeChatRef.current = targetId;
    socket.emit("joinPrivateChat", { userId: user._id, targetId });
    console.log("💬 Joined private chat with:", targetId);
  };

  const leavePrivateChat = (targetId) => {
    if (!socket) return;
    if (activeChatRef.current === targetId) activeChatRef.current = null;
    socket.emit("leavePrivateChat", { userId: user._id, targetId });
    console.log("🚪 Left private chat:", targetId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        setNotifications,
        joinChannel,
        leaveChannel,
        joinPrivateChat,
        leavePrivateChat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
