import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  // -----------------------------------------------------
  // Handle Login
  // -----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await loginUser(email, password);

      // Backend will redirect normally,
      // but here we fetch the logged user info again:
      const userInfo = await fetch("/api/me", {
        credentials: "include",
      }).then((r) => r.json());

      setUser(userInfo.user);

      setMsg("Login successful!");
      navigate("/");
    } catch (err) {
      setMsg(err?.response?.data || "Invalid login");
    }
  };

  return (
    <div className="container-react">

      <h1>Login</h1>

      <form onSubmit={handleSubmit} className="react-form">

        <label>Email</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-react-blue">
          Login
        </button>
      </form>

      {msg && <p className="info-react">{msg}</p>}

      <p>
        Don't have an account?{" "}
        <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default Login;
