import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdSave } from "react-icons/md";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function UpdateChannel({ channel, onUpdated, onClose }) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    name: channel?.name || "",
    description: channel?.description || "",
    members: channel?.members?.map((m) => (typeof m === "string" ? m : m._id)) || [],
    type: channel?.type || "channel",
  });

  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/users`, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });
        const users = res.data.users || [];
        setAllUsers(users.filter((u) => u._id !== user?._id));
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, [BACKEND_URL, user?._id, user?.token]);

  // Options for react-select
  const userOptions = allUsers.map((u) => ({
    value: u._id,
    label: `${u.username} (${u.team})`,
  }));

  const handleMemberChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      members: selected ? selected.map((s) => s.value) : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description,
        members: form.members,
        type: form.type,
      };
      console.log("Updating channel with payload:", payload);

      const res = await axios.put(`${BACKEND_URL}/channels/${channel._id}`, payload, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });

      toast.success("Channel updated successfully ✅");
      onUpdated && onUpdated(res.data);
      onClose && onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update channel");
      console.error("Error updating channel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur">
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-lg relative">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          ✏️ Edit Channel
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Channel Name */}
          <div>
            <label className="block font-semibold mb-1">Channel Name</label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter channel name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={3}
              placeholder="Enter short description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Members */}
          <div>
            <label className="block font-semibold mb-1">Members</label>
            <Select
              isMulti
              options={userOptions}
              value={userOptions.filter((u) => form.members.includes(u.value))}
              onChange={handleMemberChange}
              placeholder="Select members..."
            />
          </div>

          {/* Channel Type */}
          <div>
            <label className="block font-semibold mb-1">Channel Type</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="channel">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                <>
                  Save Changes <MdSave className="text-xl" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
