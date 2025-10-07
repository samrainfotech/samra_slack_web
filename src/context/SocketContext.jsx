import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.token) {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      // Extract base URL without /api
      const socketUrl = BACKEND_URL.replace('/api', '').replace('http://localhost:3000', 'http://localhost:5000');
      
      console.log('Connecting to socket:', socketUrl);
      
      const newSocket = io(socketUrl, {
        auth: {
          token: user.token,
        },
        autoConnect: true,
        transports: ['websocket', 'polling'],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Connection failed. Please refresh the page.");
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user?.token]);

  const joinChannel = (channelId) => {
    if (socket && channelId) {
      socket.emit("joinChannel", channelId);
    }
  };

  const leaveChannel = (channelId) => {
    if (socket && channelId) {
      socket.emit("leaveChannel", channelId);
    }
  };

  const joinPrivateChat = (userId) => {
    if (socket && userId) {
      socket.emit("joinPrivateChat", userId);
      console.log("Joining private chat with user:", userId);
    }
  };

  const leavePrivateChat = (userId) => {
    if (socket && userId) {
      socket.emit("leavePrivateChat", userId);
      console.log("Leaving private chat with user:", userId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinChannel,
    leaveChannel,
    joinPrivateChat,
    leavePrivateChat,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
