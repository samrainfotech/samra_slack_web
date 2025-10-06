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
  const [form, setForm] = useState({ username: "", email: "", password: "", team: "" });

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
    setForm({
      username: u.username || "",
      email: u.email || "",
      password: "",
      team: u.team || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ username: "", email: "", password: "", team: "" });
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      const payload = {
        username: form.username,
        email: form.email,
        team: form.team,
      };
      if (form.password) payload.password = form.password;
      await axios.put(`${BACKEND_URL}/users/${editingId}`, payload, {
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      toast.success("User updated successfully");
      cancelEdit();
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoading(true);
      await axios.delete(`${BACKEND_URL}/users/${id}`, {
        headers: authHeader,
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
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
            <th className="p-3 text-left">Team</th>
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
                {/* Username */}
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

                {/* Email */}
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

                {/* Password */}
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

                {/* Team */}
                <td className="p-3">
                  {isEditing ? (
                    <select
                      className="p-2 border rounded w-full"
                      value={form.team}
                      onChange={(e) => setForm({ ...form, team: e.target.value })}
                    >
                      <option value="">Select team</option>
                      <option value="IT">IT</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="manager">Manager</option>
                    </select>
                  ) : (
                    <span>{u.team || "-"}</span>
                  )}
                </td>

                {/* Actions */}
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
                    <>
                      <button
                        onClick={() => startEdit(u)}
                        disabled={loading}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {users?.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
