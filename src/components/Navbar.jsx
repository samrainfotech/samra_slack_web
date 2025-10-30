import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiMenu, FiUser } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick, sidebarOpen, notifications = [], setNotifications }) => {
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const modalRef = useRef(null);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if (
        modalRef.current && !modalRef.current.contains(e.target) &&
        profileRef.current && !profileRef.current.contains(e.target)
      ) {
        setShowModal(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /**  Handle Password Update */
  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error("Please fill both fields");
      return;
    }

    try {
      const token = user?.token;
      if (!token) {
        toast.error("User not authenticated");
        return;
      }

      await axios.put(
        `${BACKEND_URL}/users/user/update-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password updated successfully");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center justify-between px-6 transition-all duration-300 z-30 ${!sidebarOpen ? "md:ml-64" : ""}`}
    >
      {/* Left: Hamburger */}
      {!sidebarOpen && (
        <button className="md:hidden text-gray-600 hover:text-black" onClick={onMenuClick}>
          <FiMenu size={24} />
        </button>
      )}

      {/* Center: Company Name */}
      <h1 className="text-lg md:text-xl font-bold text-gray-800">Samra Infotech Pvt Ltd</h1>

      {/* Right: Icons */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={modalRef}>
          <div
            className="cursor-pointer text-gray-700 hover:text-black relative"
            onClick={() => setShowModal((prev) => !prev)}
          >
            <FiBell size={22} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
                {notifications.length}
              </span>
            )}
          </div>

          {showModal && (
            <div className="absolute right-0 mt-3 w-72 bg-white shadow-lg rounded-lg border z-50">
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                <button
                  className="text-xs text-blue-600 hover:underline"
                  onClick={() => setNotifications([])}
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-3">No notifications</p>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={idx} className="px-4 py-2 border-b hover:bg-gray-100 transition text-sm">
                      <p className="font-medium text-gray-800">{n.text}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(n.time).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Icon */}
        <div className="relative" ref={profileRef}>
          <FiUser
            size={22}
            className="cursor-pointer text-gray-700 hover:text-black"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          />

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                onClick={() => {
                  setPasswordModalOpen(true);
                  setShowProfileMenu(false);
                }}
              >
                Update Password
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                onClick={() => {
                  logout?.();
                  toast.success("Logged out successfully");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/*  Password Update Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Update Password</h3>

            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:ring focus:ring-blue-200 outline-none"
            />

            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring focus:ring-blue-200 outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handlePasswordUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
