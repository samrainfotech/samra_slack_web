import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FiHash, FiEdit2 } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Channels({
  onSelectChannel,
  activeChannelId,
  onEditChannel,
  onChannelsUpdate,
}) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch channels
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
    } catch (e) {
      console.error("Error fetching channels", e);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, user?._id, user?.token, onChannelsUpdate]);

  // ✅ Handle update of a channel
  const handleChannelUpdated = (updatedChannel) => {
    setChannels((prev) =>
      prev.map((ch) => (ch._id === updatedChannel._id ? updatedChannel : ch))
    );
  };

  // ✅ Handle deletion of a channel
  const handleChannelDeleted = (deletedId) => {
    setChannels((prev) => prev.filter((ch) => ch._id !== deletedId));
  };

  // Load channels on mount + whenever user changes
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  return (
    <div className="h-full bg-gray-900 text-white w-64 flex flex-col">
      <h2 className="text-lg font-bold px-4 py-3 border-b border-gray-700">
        Channels
      </h2>

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
              className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-800 transition ${
                activeChannelId === ch._id ? "bg-gray-800 font-semibold" : ""
              }`}
            >
              {/* Channel Name */}
              <div
                className="flex items-center gap-2 flex-1"
                onClick={() => onSelectChannel(ch)}
              >
                <FiHash className="text-gray-400" />
                <span>{ch.name}</span>
              </div>

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // ✅ pass update + delete callbacks to modal
                  onEditChannel &&
                    onEditChannel(ch, {
                      onUpdated: handleChannelUpdated,
                      onDeleted: handleChannelDeleted,
                    });
                }}
                className="text-gray-400 hover:text-indigo-400"
              >
                <FiEdit2 />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
