from flask import Flask, request, jsonify, session
import openai
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import timedelta


load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")

app.secret_key = os.getenv("FLASK_SECRET_KEY")

app.permanent_session_lifetime = timedelta(minutes=30)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK"}), 200

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')  
    print(f"User Input: {user_input}") 

    if 'conversation_history' not in session:
        session['conversation_history'] = [
            {"role": "system", "content": "You are a helpful French learning assistant."}
        ]

    session['conversation_history'].append({"role": "user", "content": user_input})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=session['conversation_history']
        )
        print(f"OpenAI Response: {response}")
        message = response['choices'][0]['message']['content'].strip()
        session['conversation_history'].append({"role": "assistant", "content": message})
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        message = "Error: Unable to generate a response from the AI."

    return jsonify({"response": message}), 200

@app.route('/clear', methods=['POST'])
def clear_history():
    session.pop('conversation_history', None)
    return jsonify({"status": "Conversation history cleared."}), 200

if __name__ == '__main__':
    app.run(debug=True)
