import React, { use } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AddEmployee from './AddEmployee';
import UserList from './UserList';

const AdminDashboard = () => {
    const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // call the function
    navigate("/");
    toast.success("Logged Out");
  };
  return (
    <div>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={handleLogout}>Logout</button>
      </div>
      <AddEmployee/>
      <UserList/>
    </div>
  )
}

export default AdminDashboard