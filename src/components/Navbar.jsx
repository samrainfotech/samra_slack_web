import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiMenu } from "react-icons/fi";

const Navbar = ({ onMenuClick, sidebarOpen, notifications = [], setNotifications }) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  // close modal when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center justify-between px-6
        transition-all duration-300 z-30
        ${!sidebarOpen ? "md:ml-64" : ""}
      `}
    >
      {/* Left: Hamburger */}
      {!sidebarOpen && (
        <button
          className="md:hidden text-gray-600 hover:text-black"
          onClick={onMenuClick}
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Center: Company Name */}
      <h1 className="text-lg md:text-xl font-bold text-gray-800">
        Samra Infotech Pvt Ltd
      </h1>

      {/* Right: Notification Bell */}
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

        {/* Modal */}
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
                  <div
                    key={idx}
                    className="px-4 py-2 border-b hover:bg-gray-100 transition text-sm"
                  >
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
    </nav>
  );
};

export default Navbar;
