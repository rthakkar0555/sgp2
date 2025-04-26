import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/login";
import HomePage from "./components/HomePage";
import "./styles.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect '/' to the Register page */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
