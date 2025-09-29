import { useState } from "react";
import axios from "axios";
import { IoMdAdd } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function AddEmployee() {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/users/create`, form, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      setForm({ username: "", email: "", password: "" });
      toast.success("Employee created successfully ✅");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 text-center">
        ➕ Add New Employee
      </h1>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Username
          </label>
          <input
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter username"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Email</label>
          <input
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold hover:bg-indigo-700 duration-200 w-full"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin text-lg" />
          ) : (
            <>
              Add Employee <IoMdAdd className="text-xl" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
