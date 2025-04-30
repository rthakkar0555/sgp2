// Updated Chat.jsx - Real-time & API Integrated with immediate UI push
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("http://localhost:8008", {
  withCredentials: true,
  transports: ["websocket"],
});

const Chat = ({ groupId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchMessages();
    socket.emit("join", groupId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user_typing", ({ username }) => {
      if (username !== userName) {
        setTypingUser(username);
        setTimeout(() => setTypingUser(null), 2000);
      }
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("message_deleted");
    };
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8008/api/v1/chat/group/${groupId}?page=1&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      setMessages(result.data.reverse());
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    const formData = new FormData();
    if (newMessage.trim()) {
      formData.append("content", newMessage);
    }
    if (file) {
      formData.append("attachments", file);
    }

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      sender: { username: userName },
      content: newMessage,
      attachments: file ? ["Uploading..."] : [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setFile(null);

    try {
      const response = await fetch(
        `http://localhost:8008/api/v1/chat/group/${groupId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleTyping = () => {
    socket.emit("user_typing", { groupId, username: userName });
  };

  const handleDelete = async (messageId) => {
    try {
      const response = await fetch(`http://localhost:8008/api/v1/chat/message/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="messages-list">
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.sender.username === userName ? "message-sent" : "message-received"}`}
            >
              <div className="message-header">
                <span className="message-sender">{msg.sender.username}</span>
                {msg.sender.username === userName && (
                  <button
                    className="delete-btn"
                    //onClick={() => handleDelete(msg._id)}
                  >
                    YOU
                  </button>
                )}
              </div>
              <p className="message-text">{msg.content}</p>
              {msg.attachments &&
                msg.attachments.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noreferrer">
                    📎 Attachment
                  </a>
                ))}
              <span className="message-timestamp">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        {typingUser && <p className="typing-indicator">{typingUser} is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleTyping}
          className="message-input"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input"
        />
        <button type="submit" className="send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;