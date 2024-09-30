document.getElementById("send_button").addEventListener("click", () => {
    const userInput = document.getElementById("user_input").value;
    if (userInput.trim() === "") return;  // Check if input is empty

    // Display user message in the chatbox
    const messageContainer = document.getElementById("messages");
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.textContent = userInput;
    messageContainer.appendChild(userMessage);

    // Scroll to the latest message
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Clear the input field after sending the message
    document.getElementById("user_input").value = "";

    // Create a typing indicator element
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot");
    typingIndicator.textContent = "Typing...";
    typingIndicator.setAttribute("id", "typing-indicator");
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Send user input to the backend /chat endpoint
    fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => {
        // Check if the response is okay
        console.log("Response received from backend:", response);
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.json();  // Parse the JSON response
    })
    .then(data => {
        console.log("Parsed JSON data:", data);

        // Remove the typing indicator
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }

        // Display bot response in the chatbox
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.textContent = data.response;
        messageContainer.appendChild(botMessage);

        // Scroll to the latest message
        messageContainer.scrollTop = messageContainer.scrollHeight;
    })
    .catch(error => {
        console.error("Error occurred during fetch:", error);
        
        // Remove the typing indicator
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }

        // Display error message in the chatbox
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("message", "bot");
        errorMessage.textContent = "Error: Unable to communicate with the chatbot server.";
        messageContainer.appendChild(errorMessage);

        // Scroll to the latest message
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
});
