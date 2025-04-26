// src/components/CreateGroup.jsx
import React, { useState } from "react";
import cssLogo from "../assets/images/css.png"; // Import the css.png image

const CreateGroup = ({ onGroupCreated, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const myHeaders = new Headers();
      const accessToken = localStorage.getItem("accessToken");
      myHeaders.append("Authorization", `Bearer ${accessToken}`);

      const formdata = new FormData();
      formdata.append("name", name);
      formdata.append("description", description);
      if (groupImage) {
        formdata.append("groupImage", groupImage);
      }

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
      };

      const response = await fetch("http://localhost:8008/api/v1/groups/create", requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create group");
      }

      const result = await response.json();
      
      if (result.success) {
        onGroupCreated(result.data);
        onClose();
      } else {
        throw new Error(result.message || "Failed to create group");
      }
    } catch (error) {
      console.error("Create group error:", error);
      setError(error.message || "An error occurred while creating the group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="header">
        <h1>Create a New Group</h1>
        <button className="home-btn" onClick={onClose}>
          
        </button>
      </div>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Group Name <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>
            Description <span className="required">*</span>
          </label>
          <textarea
            placeholder="Enter group description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Group Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="create-submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
