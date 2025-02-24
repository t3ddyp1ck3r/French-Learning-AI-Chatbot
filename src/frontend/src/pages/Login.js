import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";  // Ensure this is imported

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:5000/login", { username, password });
            localStorage.setItem("token", response.data.token);
            navigate("/chat");
        } catch (error) {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="auth-container">
            <h2>Welcome Back!</h2>
            <p className="welcome-text">Log in to continue your French learning journey.</p>

            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>

            <p>Don't have an account? <button className="switch-button" onClick={() => navigate("/signup")}>Sign Up</button></p>
        </div>
    );
};

export default Login;
