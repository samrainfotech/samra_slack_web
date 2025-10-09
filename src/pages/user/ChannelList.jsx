import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { FiHash } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Channels({ onSelectChannel, activeChannelId, onChannelsUpdate }) {
  const { user } = useAuth();
  const { joinChannel, leaveChannel } = useSocket();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChannels = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/channels`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });

      const data = Array.isArray(res.data) ? res.data : res.data.channels;

      const userChannels = (data || []).filter((ch) =>
        ch.members?.some((m) => m._id === user._id || m === user._id)
      );

      setChannels(userChannels);
      onChannelsUpdate && onChannelsUpdate(userChannels);
      console.log("Fetched channels:", userChannels);
      // ✅ Join all user's channels on connect
      userChannels.forEach((ch) => joinChannel(ch._id));
    } catch (e) {
      console.error("Error fetching channels", e);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, user?._id, user?.token, onChannelsUpdate, joinChannel]);

  useEffect(() => {
    fetchChannels();

    // ✅ Cleanup: leave channels when unmounting
    return () => {
      channels.forEach((ch) => leaveChannel(ch._id));
    };
  }, [fetchChannels]);

  return (
    <div className="h-full bg-gray-900 text-white w-64 flex flex-col">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <AiOutlineLoading3Quarters className="animate-spin text-xl" />
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {channels.length === 0 && (
            <p className="text-sm text-gray-400 px-4 py-2">
              You are not in any channels yet.
            </p>
          )}

          {channels.map((ch) => (
            <li
              key={ch._id}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-800 transition ${
                activeChannelId === ch._id ? "bg-gray-800 font-semibold" : ""
              }`}
              onClick={() => onSelectChannel(ch)}
            >
              <FiHash className="text-gray-400 mr-2" />
              <span>{ch.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
