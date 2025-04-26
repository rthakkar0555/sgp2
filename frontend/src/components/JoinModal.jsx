import React, { useState } from "react";

const JoinModal = ({ onClose, onAddGroup, onOpenCreateGroup }) => {
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!groupId.trim()) {
      setError("Please enter a valid group ID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const myHeaders = new Headers();
      const accessToken = localStorage.getItem("accessToken");
      myHeaders.append("Authorization", `Bearer ${accessToken}`);
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ groupId }),
        redirect: "follow"
      };

      const response = await fetch("http://localhost:8008/api/v1/groups/join", requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join group");
      }

      const result = await response.json();
      
      if (result.success) {
        onAddGroup(result.data);
        onClose();
      } else {
        throw new Error(result.message || "Failed to join group");
      }
    } catch (error) {
      console.error("Join error:", error);
      setError(error.message || "An error occurred while joining the group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-modal">
      <div className="modal-header">
       
      </div>
      <div className="modal-body">
        <p>Join a group using its ID</p>
        <span className="close-btn" onClick={onClose}>
          ×
        </span>
        <div className="join-form">
          <input
            type="text"
            placeholder="Enter group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={loading}
          />
          {error && <div className="error-message">{error}</div>}
          <button
            className="join-btn"
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Group"}
          </button>
        </div>
        <div className="create-option">
          <p>Don't have a group ID?</p>
          <button
            className="create-btn"
            onClick={() => {
              onClose();
              onOpenCreateGroup();
            }}
            disabled={loading}
          >
            Create a new group
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;