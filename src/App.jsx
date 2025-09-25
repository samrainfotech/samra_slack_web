
// import Login from './pages/Login';
// import { useAuth } from './context/AuthContext';

// function App() {
//   const { user } = useAuth();

//   return ( 
//     <Router>
//       <Routes>
//         <Route path="/" element={user ? <h1>Dashboard   hello</h1> : <Login />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {user?.username} ({user?.role})
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
