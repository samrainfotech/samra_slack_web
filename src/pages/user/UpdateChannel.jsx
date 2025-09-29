import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdSave, MdDelete } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function EditChannel({ channel, onClose, onUpdated, onDeleted }) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    name: channel?.name || "",
    description: channel?.description || "",
    type: channel?.type || "public",
    members: channel?.members?.map((m) => (m._id ? m._id : m)) || [],
  });

  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [creator, setCreator] = useState(null);

  // ✅ Fetch all users (exclude creator from dropdown)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/users`, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });

        const users = res.data.users || res.data || [];
        const creatorUser = users.find((u) => u._id === channel?.createdBy);

        setCreator(creatorUser);
        setAllUsers(users.filter((u) => u._id !== channel?.createdBy));
      } catch (err) {
        console.error("Error fetching users", err);
        setAllUsers([]);
      }
    };
    fetchUsers();
  }, [BACKEND_URL, user?.token, channel?.createdBy]);

  // ✅ Options for react-select
  const userOptions = allUsers.map((u) => ({
    value: u._id,
    label: `${u.username} (${u.email})`,
  }));

  // ✅ Preselect members
  const selectedMembers = form.members
    .map((id) => {
      const found = allUsers.find((u) => u._id === id);
      return found
        ? { value: found._id, label: `${found.username} (${found.email})` }
        : null;
    })
    .filter(Boolean);

  // ✅ Handle dropdown change
  const handleMemberChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      members: selected ? selected.map((s) => s.value) : [],
    }));
  };

  // ✅ Handle text/select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Channel name is required");
      return;
    }

    try {
      setLoading(true);

      const updatedMembers = [...new Set([...form.members, user?._id])];
      const payload = { ...form, members: updatedMembers };

      const res = await axios.put(
        `${BACKEND_URL}/channels/${channel._id}`,
        payload,
        {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        }
      );

      toast.success("Channel updated successfully 🎉");
      onUpdated && onUpdated(res.data);
      onClose && onClose();
    } catch (err) {
      console.error("Error updating channel:", err);
      toast.error(err.response?.data?.message || "Failed to update channel");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete channel
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this channel?")) return;

    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/channels/${channel._id}`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });

      toast.success("Channel deleted successfully 🗑️");
      onDeleted && onDeleted(channel._id);
      onClose && onClose();
    } catch (err) {
      console.error("Error deleting channel:", err);
      toast.error(err.response?.data?.message || "Failed to delete channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 text-center">
        ✏️ Edit Channel
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Channel Name */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Channel Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter channel name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Enter short description"
          />
        </div>

        {/* Channel Type */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Channel Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="public">🌍 Public</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        {/* Creator (readonly) */}
        {creator && (
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Created By
            </label>
            <input
              type="text"
              value={creator.username || creator.email}
              disabled
              className="p-3 w-full rounded-lg border border-gray-200 bg-gray-100"
            />
          </div>
        )}

        {/* Members */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Members
          </label>
          <Select
            isMulti
            options={userOptions}
            value={selectedMembers}
            onChange={handleMemberChange}
            placeholder="Select or remove members..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-lg" />
            ) : (
              <>
                Save Changes <MdSave className="text-xl" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin text-lg" />
            ) : (
              <>
                Delete <MdDelete className="text-xl" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
