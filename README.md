## French Learning Chatbot

## Project Description
The French Learning Chatbot is an interactive tool designed to help users practice French through natural and dynamic conversations. Leveraging OpenAI's GPT-3.5-turbo model, this chatbot provides real-time responses, maintaining context to simulate realistic dialogues. With features like a context-aware memory and session-clearing options, it offers an engaging way to learn French compared to traditional language-learning platforms.

## Project Structure
-Frontend: HTML, CSS, and JavaScript for the chat interface and user interaction.
-Backend: Flask (Python) server for handling user inputs, managing session history, and integrating with the OpenAI API.
-AI Integration: OpenAI GPT-3.5-turbo model for generating human-like responses in French.

## Features
-Interactive Conversation: Users can type messages and receive context-aware responses in French.
-Session Management: Maintains conversation history during the session to provide relevant responses.
-Clear Chat Functionality: Users can clear the chat history using a dedicated button to reset the conversation.
-Data Privacy: No data is stored permanently; everything is handled in-memory during the session.


## Project Setup
To run this project on your local machine, follow the steps below:

1. Prerequisites
-Python 3.7 or higher
-OpenAI API Key (Sign up at OpenAI to get your API key)
-Flask Library: pip install Flask
-OpenAI Library: pip install openai
-Flask-CORS Library: pip install flask-cors
-Dotenv Library: pip install python-dotenv

2. Setting Up the Project

1.Clone the Repository:
git clone https://github.com/t3ddyp1ck3r/french-learning-chatbot.git

cd french-learning-chatbot

2.Create a .env File in the root directory:
OPENAI_API_KEY=your_openai_api_key
FLASK_SECRET_KEY=your_flask_secret_key

3.Install Required Libraries:
pip install -r requirements.txt

4.Run the Flask Server:
python app.py

5.Open index.html in a Browser: Navigate to the frontend folder and open index.html in your preferred browser.

Project Files
-app.py: The main Flask backend server handling user requests and OpenAI API calls.
-index.html: The HTML file for the chat interface.
-style.css: The CSS file for styling the chat interface.
-script.js: The JavaScript file handling frontend interactions.
-.env File: Contains API keys and secret keys (not included in version control).

## How to Use
1. Start a Conversation: Type a message like “Bonjour, je veux apprendre le français” to initiate a conversation in French.

2. Ask for Translations: Try asking “Comment dit-on 'apple' en français ?” to get vocabulary help.

3. Clear the Conversation: Use the Clear Chat button to reset the chat history at any time.

## Privacy and Security
-All user interactions are managed in-memory and are cleared after the session ends.
-The project uses Flask's session management and a secure secret_key to protect session data.
-API keys and sensitive data are stored using environment variables, ensuring they are not exposed in the source code.

## Future Enhancements
-Voice-Based Interactions: Enable users to speak directly with the chatbot.
-Grammar Correction: Implement grammar checks to help users learn correct sentence structures.
-Personalized Learning Paths: Customize responses and suggestions based on user progress

## Project Demo
Provided a video of the project

## Final Checklist
Replace the placeholders (yourusername, your_openai_api_key, etc.) with actual values.
