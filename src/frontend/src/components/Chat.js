import React, { useState } from "react";
import "../styles/chat.css";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        // Add user's message to state
        setMessages([...messages, { role: "user", content: userInput }]);
        setUserInput("");

        // Add typing indicator
        setMessages(prev => [...prev, { role: "bot", content: "Typing..." }]);

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput }),
            });

            if (!response.ok) throw new Error("Network response error");

            const data = await response.json();

            setMessages(prev => [
                ...prev.slice(0, -1), // Remove typing indicator
                { role: "bot", content: data.response }
            ]);

        } catch (error) {
            setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "bot", content: "Error: Unable to reach chatbot." }
            ]);
        }
    };

    const clearChat = async () => {
        try {
            await fetch("http://127.0.0.1:5000/clear", { method: "POST" });
            setMessages([]);
        } catch (error) {
            console.error("Failed to clear chat history.");
        }
    };

    return (
        <div className="container">
            <h1>French Learning Chatbot</h1>
            <div id="chatbox">
                <div id="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}
                </div>
            </div>

            <div id="input-container">
                <input
                    type="text"
                    id="user_input"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <button id="send_button" onClick={sendMessage}>Send</button>
                <button id="clear_button" onClick={clearChat}>Clear Chat</button>
            </div>
            <p className="privacy-disclaimer">Your data is not stored. All interactions are cleared after the session ends.</p>
        </div>
    );
};

export default Chat;
