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
@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    username = get_jwt_identity()  # Get logged-in user
    return jsonify({"message": f"Hello, {username}! Your chatbot is now secured!"})

if __name__ == '__main__':
    app.run(debug=True)
