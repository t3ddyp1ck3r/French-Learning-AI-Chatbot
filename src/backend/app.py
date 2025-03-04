from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# Security Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

# Fetch user chat history from MongoDB
def get_chat_history(username):
    user_data = mongo.db.users.find_one({"username": username})
    return user_data.get("chat_history", []) if user_data else []

# Save chat history to MongoDB
def save_chat_history(username, history):
    mongo.db.users.update_one({"username": username}, {"$set": {"chat_history": history}}, upsert=True)

# Home Route to Check MongoDB Connection
@app.route('/', methods=['GET'])
def home():
    try:
        mongo.db.users.find_one()
        mongo_status = "Connected"
    except Exception as e:
        mongo_status = f"Error: {e}"

    return jsonify({
        "message": "Backend is running successfully!",
        "MongoDB Status": mongo_status
    }), 200

# User Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if mongo.db.users.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    mongo.db.users.insert_one({"username": username, "password": hashed_password})

    return jsonify({"message": "User registered successfully"}), 201

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = mongo.db.users.find_one({"username": username})
    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=username)
    return jsonify({"message": "Login successful", "token": token}), 200

# Chat Route (Supports Language Switching & Saves History)
@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    username = get_jwt_identity()
    data = request.json
    user_input = data.get('message')
    language = data.get('language', 'French')  # Default to French

    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    chat_history = get_chat_history(username)

    # Adjust AI behavior based on language preference
    system_prompt = "You are a helpful AI assistant that helps users learn French."
    if language == "English":
        system_prompt = "You are a helpful AI assistant that provides English translations and explanations."

    # Add user input to chat history
    chat_history.append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": system_prompt}] + chat_history
        )

        message = response['choices'][0]['message']['content'].strip()
        chat_history.append({"role": "assistant", "content": message})

        # Save updated chat history to MongoDB
        save_chat_history(username, chat_history)

    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        message = "Error: Unable to generate a response from the AI."

    return jsonify({"response": message}), 200

# Route to Get Chat History
@app.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    username = get_jwt_identity()
    chat_history = get_chat_history(username)
    return jsonify({"history": chat_history}), 200

# Route to Clear Chat History
@app.route('/clear', methods=['POST'])
@jwt_required()
def clear_history():
    username = get_jwt_identity()
    save_chat_history(username, [])  # Clear stored history
    return jsonify({"status": "Conversation history cleared."}), 200

if __name__ == '__main__':
    app.run(debug=True)
