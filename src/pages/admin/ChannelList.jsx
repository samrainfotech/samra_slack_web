import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import EditChannel from "./EditChannel"; // import new component

export default function ChannelList() {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null); // store channel object

  const authHeader = useMemo(
    () => (user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    [user?.token]
  );

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BACKEND_URL}/channels`, {
        headers: authHeader,
      });
      setChannels(Array.isArray(data?.channels) ? data.channels : data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteChannel = async (id) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/channels/${id}`, {
        headers: authHeader,
      });
      toast.success("Channel deleted successfully");
      fetchChannels();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
       <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
           Channel List
        </h1>
      <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {channels?.map((c) => {
            const id = c._id || c.id;
            return (
              <tr
                key={id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.description || "-"}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setEditingChannel(c)}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteChannel(id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>  
            );
          })}
          {channels?.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">
                No channels found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for editing */}
      {editingChannel && (
        <EditChannel
          channel={editingChannel}
          onClose={() => setEditingChannel(null)}
          onUpdated={fetchChannels}
        />
      )}
    </div>
  );
}
