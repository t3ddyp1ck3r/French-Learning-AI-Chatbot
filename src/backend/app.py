from flask import Flask, request, jsonify, session
import openai
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
import os
from datetime import timedelta

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
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.permanent_session_lifetime = timedelta(minutes=30)

# Home Route to Check MongoDB Connection
@app.route('/', methods=['GET'])
def home():
    try:
        # Test MongoDB Connection
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

# Chat Route with JWT Authentication
from flask_jwt_extended import jwt_required, get_jwt_identity
import openai

@app.route('/chat', methods=['POST'])
@jwt_required()  # Ensures only authenticated users can chat
def chat():
    username = get_jwt_identity()  # Get logged-in user
    user_input = request.json.get('message')

    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    # Ensure session stores conversation history
    if 'conversation_history' not in session:
        session['conversation_history'] = [
            {"role": "system", "content": "You are a helpful AI assistant helping users learn French."}
        ]
    # Append user message to conversation history
    session['conversation_history'].append({"role": "user", "content": user_input})

    try:
        # Make request to OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=session['conversation_history']
        )
        # Extract AI response
        message = response['choices'][0]['message']['content'].strip()
        session['conversation_history'].append({"role": "assistant", "content": message})

    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        message = "Error: Unable to generate a response from the AI."

    return jsonify({"response": message}), 200

if __name__ == '__main__':
    app.run(debug=True)
