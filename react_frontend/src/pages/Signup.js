import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  // -----------------------------------------------------
  // Handle Signup
  // -----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      await signupUser(name, email, password);
      setMsg("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMsg(err?.response?.data || "Error creating account");
    }
  };

  return (
    <div className="container-react">

      <h1>Sign Up</h1>

      <form onSubmit={handleSubmit} className="react-form">

        <label>Full Name</label>
        <input
          type="text"
          value={name}
          placeholder="Your full name"
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          placeholder="Choose a secure password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-react-blue">
          Create Account
        </button>
      </form>

      {msg && <p className="info-react">{msg}</p>}

      <p>
        Already have an account?{" "}
        <Link to="/login">Login</Link>
      </p>

    </div>
  );
}

export default Signup;
