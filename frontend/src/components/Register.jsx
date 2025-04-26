import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import defaultUserPhoto from "../assets/images/user.png";

const Register = ({ onClose = () => {}, onRegister = () => {} }) => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(defaultUserPhoto);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, photo: "Image size should be less than 2MB" });
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setPhotoPreview(readerEvent.target.result);
        setErrors({ ...errors, photo: null });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm password";
    
    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("username", username.toLowerCase());
    formData.append("fullName", fullName.trim());
    formData.append("email", email.trim());
    formData.append("password", password);
    formData.append("avatar", photo || defaultUserPhoto);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8008/api/v1/users/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed. Please try again.");
      }

      const data = await response.json();
      if (data.success) {
        alert("Registration successful! Please login to continue.");
        onRegister(data);
        onClose();
        navigate("/login");
      } else {
        throw new Error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="header">
        <h1>Create Account</h1>
       
      </div>

      <form id="registerForm" className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profilePhoto">Profile Photo</label>
          <div className="photo-preview">
            <img src={photoPreview} alt="Profile Preview" />
          </div>
          <button 
            type="button" 
            className="upload-btn"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            Choose Photo
          </button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange} 
            ref={fileInputRef} 
            style={{ display: "none" }} 
          />
          {errors.photo && <span className="error-message">{errors.photo}</span>}
        </div>

        <div className="form-group">
          <label>Full Name <span className="required">*</span></label>
          <input 
            type="text" 
            placeholder="Enter full name" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            className={errors.fullName ? 'error-input' : ''}
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label>Username <span className="required">*</span></label>
          <input 
            type="text" 
            placeholder="Enter username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className={errors.username ? 'error-input' : ''}
          />
          {errors.username && <span className="error-message">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>Email <span className="required">*</span></label>
          <input 
            type="email" 
            placeholder="Enter email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={errors.email ? 'error-input' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password <span className="required">*</span></label>
          <input 
            type="password" 
            placeholder="Enter password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className={errors.password ? 'error-input' : ''}
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password <span className="required">*</span></label>
          <input 
            type="password" 
            placeholder="Confirm password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className={errors.confirmPassword ? 'error-input' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="login-link">Already have an account? <a href="/login">Login here</a></p>
    </div>
  );
};

export default Register;
