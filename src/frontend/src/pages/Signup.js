import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        try {
            await axios.post("http://127.0.0.1:5000/signup", { username, password });
            alert("Signup successful!");
            navigate("/");
        } catch (error) {
            alert("Error: User already exists.");
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignup}>Sign Up</button>
        </div>
    );
};

export default Signup;
