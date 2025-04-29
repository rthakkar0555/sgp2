import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ onClose = () => {}, onLogin = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and Password are required!");
      return;
    }

    setLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      
      // Get existing tokens from localStorage if available
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (accessToken && refreshToken) {
        myHeaders.append("Cookie", `accessToken=${accessToken}; refreshToken=${refreshToken}`);
      }

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ email, password }),
        credentials: "include"
      };

      const response = await fetch("http://localhost:8008/api/v1/users/login", requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed. Please check your credentials.");
      }

      const result = await response.json();
      
      if (result.success) {
        // Store new tokens in localStorage
        if (result.data.accessToken) {
          localStorage.setItem("accessToken", result.data.accessToken);
        }
        if (result.data.refreshToken) {
          localStorage.setItem("refreshToken", result.data.refreshToken);
        }

        // Pass user data to parent component
        const userData = {
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        };

        alert("Login successful!");
        onLogin(userData);
        localStorage.setItem("userId",JSON.stringify(result.data.user._id))
        localStorage.setItem("user", JSON.stringify(result.data.user.fullName));
        localStorage.setItem("userEmail", JSON.stringify(result.data.user.email));
        localStorage.setItem("userimg", JSON.stringify(result.data.user.avatar));
        localStorage.setItem("isLoggedIn", "true");
        onClose();
        navigate("/dashboard");
      } else {
        throw new Error(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.message === "Failed to fetch") {
        setError("Unable to connect to server. Please check your internet connection.");
      } else {
        setError(error.message || "An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="header">
        <h1>Login</h1>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;