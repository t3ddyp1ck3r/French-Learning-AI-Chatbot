import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const navigate = useNavigate();
    const chatboxRef = useRef(null); // Reference for the chatbox

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must log in first!");
            navigate("/");
            return;
        }
        fetchHistory(token);
    }, [navigate]);

    // Auto-scroll to the latest message
    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]); // Triggers scroll when messages update

    // Fetch stored chat history from MongoDB
    const fetchHistory = async (token) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/history", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });
    
            if (response.ok) {
                const data = await response.json();
    
                // Ensure messages have a proper role assigned
                const formattedMessages = data.history.map(msg => ({
                    role: msg.role || "bot", // Default to 'bot' if missing
                    content: msg.content
                }));
    
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Failed to fetch chat history.");
        }
    };    

    // Send a message to the chatbot
    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired. Please log in again.");
            navigate("/");
            return;
        }

        // Add user message to chat state
        setMessages(prev => [...prev, { role: "user", content: userInput }]);
        setUserInput("");

        // Add "Typing..." indicator
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

            if (!response.ok) throw new Error("Network error");

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

    // Clear chat history
    const clearChat = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired. Please log in again.");
            navigate("/");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/clear", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setMessages([]); // Clear chat messages in UI
                alert("Chat history cleared!");
            }
        } catch (error) {
            console.error("Failed to clear chat history.");
        }
    };

    return (
        <div className="container">
            <div className="chat-header">
                <h1>French Learning AI Chatbot</h1>
                <button className="logout-button" onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>Logout</button>
            </div>

            {/* Chat Box */}
            <div id="chatbox" ref={chatboxRef}> {/* Added ref here */}
                <div id="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            {msg.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* Input Section */}
            <div id="input-container">
                <input
                    type="text"
                    id="user_input"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button id="send_button" onClick={sendMessage}>Send</button>
                <button id="clear_button" onClick={clearChat}>Clear Chat History</button>
            </div>
        </div>
    );
};

export default Chat;
