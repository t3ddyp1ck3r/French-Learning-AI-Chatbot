import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must log in first!");
            navigate("/");
        }
    }, [navigate]);

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired. Please log in again.");
            navigate("/");
            return;
        }
        // Add user's message to state
        setMessages(prev => [...prev, { role: "user", content: userInput }]);
        setUserInput("");

        // Add typing indicator
        setMessages(prev => [...prev, { role: "bot", content: "Typing..." }]);

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: userInput }),
            });

            if (response.status === 401) {
                alert("Session expired. Please log in again.");
                localStorage.removeItem("token");
                navigate("/");
                return;
            }

            if (!response.ok) throw new Error("Network error");

            const data = await response.json();

            setMessages(prev => [
                ...prev.slice(0, -1), 
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
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired. Please log in again.");
            navigate("/");
            return;
        }

        try {
            await fetch("http://127.0.0.1:5000/clear", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setMessages([]);
        } catch (error) {
            console.error("Failed to clear chat history.");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="container">
            <h1>French Learning Chatbot</h1>
            <button className="logout-button" onClick={logout}>Logout</button>

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
