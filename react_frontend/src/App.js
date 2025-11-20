import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { logoutUser } from "./api";

function App() {
  const [user, setUser] = useState(null); // stores logged user info
  const navigate = useNavigate();

  // --------------------------------------------
  // Fetch session user on first load
  // --------------------------------------------
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) return setUser(null);
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  // --------------------------------------------
  // LOGOUT HANDLER
  // --------------------------------------------
  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      {/* -------------------------------------------------
           NAVBAR
      ------------------------------------------------- */}
      <nav className="navbar-react">
        <Link to="/" className="nav-react-item">Home</Link>

        {user ? (
          <>
            <span className="nav-react-item">
              Hi, <strong>{user.name}</strong>
            </span>

            <Link to="/dashboard" className="nav-react-item">
              My Dashboard
            </Link>

            {user.is_admin === 1 && (
              <Link to="/admin" className="nav-react-item">
                Admin Panel
              </Link>
            )}

            <button onClick={handleLogout} className="nav-react-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-react-item">Login</Link>
            <Link to="/signup" className="nav-react-item">Signup</Link>
          </>
        )}
      </nav>

      {/* -------------------------------------------------
           ROUTES
      ------------------------------------------------- */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<UserDashboard user={user} />} />
        <Route path="/admin" element={<AdminDashboard user={user} />} />

        {/* Fallback */}
        <Route path="*" element={<h2 style={{ padding: 40 }}>Page Not Found</h2>} />
      </Routes>
    </div>
  );
}

export default App;
