import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FiHash } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Channels({ onSelectChannel, activeChannelId }) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch channels
 useEffect(() => {
  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/channels`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });

      // Support both `{ channels: [...] }` and raw `[...]`
      const data = Array.isArray(res.data) ? res.data : res.data.channels;

      console.log("Fetched channels:", data?.map((ch) => ch.name));

      setChannels(data || []);
    } catch (e) {
      console.error("Error fetching channels", e);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  fetchChannels();
}, [BACKEND_URL, user?.token]);


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
              No channels yet.
            </p>
          )}

          {channels.map((ch) => (
            <li
              key={ch._id}
              onClick={() => onSelectChannel(ch)}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-800 transition ${
                activeChannelId === ch._id ? "bg-gray-800 font-semibold" : ""
              }`}
            >
              <FiHash className="text-gray-400" />
              <span>{ch.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
