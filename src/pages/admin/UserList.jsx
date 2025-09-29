import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function UserList() {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const authHeader = useMemo(
    () => (user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    [user?.token]
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BACKEND_URL}/users`, {
        headers: authHeader,
      });
      setUsers(Array.isArray(data?.users) ? data.users : data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (u) => {
    setEditingId(u._id || u.id);
    setForm({ username: u.username || "", email: u.email || "", password: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ username: "", email: "", password: "" });
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      const payload = { username: form.username, email: form.email };
      if (form.password) payload.password = form.password;
      await axios.put(`${BACKEND_URL}/users/${editingId}`, payload, {
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      toast.success("User updated successfully ✅");
      cancelEdit();
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Password</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {users?.map((u) => {
            const id = u._id || u.id;
            const isEditing = editingId === id;
            return (
              <tr
                key={id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">
                  {isEditing ? (
                    <input
                      className="p-2 border rounded w-full"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  ) : (
                    u.username
                  )}
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <input
                      className="p-2 border rounded w-full"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="p-3">
                  {isEditing ? (
                    <input
                      type="password"
                      className="p-2 border rounded w-full"
                      value={form.password}
                      placeholder="New password"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  ) : (
                    <span className="text-gray-400">••••••••</span>
                  )}
                </td>
                <td className="p-3 space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(u)}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {users?.length === 0 && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-gray-500">
                No users found 🚫
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
