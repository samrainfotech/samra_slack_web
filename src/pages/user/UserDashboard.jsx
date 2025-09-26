import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // call the function
    navigate("/");
    toast.success("Logged Out");
  }
    return (
      <div>
        UserDashboard
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  };
export default UserDashboard;
