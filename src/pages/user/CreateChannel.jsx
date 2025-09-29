import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function CreateChannel({ onChannelCreated }) {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // ✅ Fetch all users (except creator)
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
    label: `${u.username} (${u.email})`,
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
        createdBy: user?._id,
        members: [...new Set([user?._id, ...form.members])],
      };

      const res = await axios.post(`${BACKEND_URL}/channels`, payload, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });

      setForm({ name: "", description: "", members: [] });
      toast.success("Channel created successfully 🎉");

      // 🔄 trigger refresh in parent
      onChannelCreated && onChannelCreated(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        ➕ Create New Channel
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
          <label className="block font-semibold mb-1">Add Members</label>
          <Select
            isMulti
            options={userOptions}
            value={userOptions.filter((u) => form.members.includes(u.value))}
            onChange={handleMemberChange}
            placeholder="Select members..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin" />
          ) : (
            <>
              Create Channel <IoMdAdd className="text-xl" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
