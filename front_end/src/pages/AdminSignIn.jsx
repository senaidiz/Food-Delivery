import { API_URL } from "../config";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";

export default function AdminSignIn() {
  const navigate = useNavigate(); //for navigating between routes

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  //login authentication for admin
  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("adminToken", data.token);
      navigate("/admin");
    } else {
      alert(data.error || "Login failed");
    }
  }

  //handle change for form
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div id="signup-page-wrapper">
      <div className={`container`}>

        {/* SIGN IN */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Sign in</h1>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} />
            <a href="/signup" className="signup-page-admin-btn">Sign In as Customer</a>
            <button className="btn">Sign In</button>
          </form>
        </div>

        {/* OVERLAY SECTION */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">
              <h1>Welcome Admin!</h1>
              <p className="signup-p">Enter your details to add an account</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}