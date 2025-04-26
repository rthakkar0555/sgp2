// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";

const Chat = ({ groupId, userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage when the component mounts or groupId changes
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(`chat_${groupId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]);
      }
      setError(null);
    } catch (err) {
      setError("Chat is not working at the moment.");
      setMessages([]);
    }
  }, [groupId]);

  // Scroll to the bottom of the messages list when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: userName,
      timestamp: new Date().toLocaleTimeString(),
    };

    try {
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      localStorage.setItem(`chat_${groupId}`, JSON.stringify(updatedMessages));
      setNewMessage("");
      setError(null);
    } catch (err) {
      setError("Chat is not working at the moment. Failed to send message.");
    }
  };

  return (
    <div className="chat-container">
      {error ? (
        <p className="chat-error">{error}</p>
      ) : (
        <>
          <div className="messages-list">
            {messages.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.sender === userName ? "message-sent" : "message-received"
                  }`}
                >
                  <p className="message-sender">rishi</p>
                  <p className="message-text">{msg.text}</p>
                  <span className="message-timestamp">{msg.timestamp}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="message-input"
            />
            <button type="submit" className="send-btn">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;