from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)  # Optional: Enables CORS support to avoid cross-origin issues

# Set up OpenAI API key (Replace with your own API key)
openai.api_key = "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"

# Store conversation history in memory
conversation_history = [
    {"role": "system", "content": "You are a helpful French learning assistant."}
]

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK"}), 200

# Chat endpoint to handle messages
@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')  # Extract the user message from the request
    print(f"User Input: {user_input}")  # Log user input for debugging

    # Append the user message to the conversation history
    conversation_history.append({"role": "user", "content": user_input})

    # OpenAI API call using the updated model with conversation context
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=conversation_history  # Send the entire conversation history
        )
        print(f"OpenAI Response: {response}")  # Log the full OpenAI response
        message = response['choices'][0]['message']['content'].strip()  # Extract and format the response

        # Append the AI's response to the conversation history
        conversation_history.append({"role": "assistant", "content": message})
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        message = "Error: Unable to generate a response from the AI."

    return jsonify({"response": message}), 200

if __name__ == '__main__':
    app.run(debug=True)
