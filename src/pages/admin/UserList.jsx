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
      if (form.password) payload.password = form.password; // only send if filled
      await axios.put(`${BACKEND_URL}/users/${editingId}`, payload, {
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      toast.success("User updated");
      cancelEdit();
      fetchUsers();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-48 m-5 mt-6 p-6 shadow-[0_3px_10px_rgb(0,0,0,0.1)] rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Users</h2>
        <button
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Username</th>
                <th className="p-2">Email</th>
                <th className="p-2">Password</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => {
                const id = u._id || u.id;
                const isEditing = editingId === id;
                return (
                  <tr key={id} className="border-b hover:bg-gray-50">
                    {/* Username */}
                    <td className="p-2">
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
                    <td className="p-2">
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
                    <td className="p-2">
                      {isEditing ? (
                        <input
                          type="password"
                          className="p-2 border rounded w-full"
                          value={form.password}
                          placeholder="Enter new password"
                          onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                          }
                        />
                      ) : (
                        <span className="text-gray-400">••••••••</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="p-2 space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                            onClick={saveEdit}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-200 rounded"
                            onClick={cancelEdit}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                          onClick={() => startEdit(u)}
                          disabled={loading}
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
                  <td className="p-3 text-gray-500" colSpan={4}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
