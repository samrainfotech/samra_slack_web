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
      await axios.post(
        `${BACKEND_URL}/users/create`,
        form,
        { headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {} }
      );
      setForm({ username: "", email: "", password: "" });
      console.log(user);
      
      toast.success("Employee created");
      // no need to refetch here; EmployeeList exposes a refresh button and auto refresh on mount
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-48 m-5 mt-20 p-10 shadow-[0_3px_10px_rgb(0,0,0,0.1)] rounded-xl">
      <div className=" flex items-center justify-center mb-5">
        <img src="/logo.png" className="w-20" alt="logo" />
      </div>
      <h1 className="text-3xl font-extrabold mb-6 text-center text-black tracking-wide">
        Add Employee
      </h1>
      <form onSubmit={submit} className="space-y-5 grid min-w-xl">
        <div>
          <label htmlFor="" className=" font-semibold">
            Enter Username
          </label>
          <input
            className="p-3 w-full rounded-lg border-2 border-gray-300 focus:border-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Username"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="" className="font-semibold">Enter Email</label>
          <input
            className="p-3 w-full rounded-lg border-2 border-gray-300 focus:border-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="" className="font-semibold">Enter Password</label>

          <input
            className="p-3 w-full rounded-lg border-2 border-gray-300 focus:border-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button
          className="bg-blue-500 flex items-center justify-center gap-1 p-3 rounded-lg text-white hover:bg-blue-600 duration-200 cursor-pointer"
          disabled={loading}
        >
          {loading ? <AiOutlineLoading3Quarters /> : "Add Employee"}
          {loading ? "" : <IoMdAdd className=" text-xl" />}
        </button>
      </form>
    </div>
  );
}