import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; 
import { IoMdAdd } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function CreateChannel() {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // ✅ Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/users`, {
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        });

        // ❌ Remove creator from dropdown
        const filtered = (res.data.users || []).filter((u) => u._id !== user?._id);

        setAllUsers(filtered);
      } catch (e) {
        console.error("Error fetching users", e);
        setAllUsers([]);
      }
    };
    fetchUsers();
  }, [BACKEND_URL, user?._id, user?.token]);

  // ✅ Format options for react-select
  const userOptions = allUsers.map((u) => ({
    value: u._id,
    label: `${u.username} (${u.email})`,
  }));

  const handleMemberChange = (selected) => {
    setForm({
      ...form,
      members: selected ? selected.map((s) => s.value) : [],
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description,
        createdBy: user?._id, // ✅ creator sent separately
        members: [...new Set([user?._id, ...form.members])], // ✅ always includes creator
      };

      console.log("📤 Channel Payload:", payload);

      await axios.post(`${BACKEND_URL}/channels`, payload, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });

      setForm({ name: "", description: "", members: [] });
      toast.success("Channel created successfully ✅");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 text-center">
        ➕ Create New Channel
      </h1>
      <form onSubmit={submit} className="space-y-5">
        {/* Channel Name */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Channel Name
          </label>
          <input
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter channel name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Description
          </label>
          <textarea
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Enter short description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Members with react-select */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Add Members
          </label>
          <Select
            isMulti
            options={userOptions}
            value={userOptions.filter((u) => form.members.includes(u.value))}
            onChange={handleMemberChange}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select members..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold hover:bg-indigo-700 duration-200 w-full"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin text-lg" />
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
