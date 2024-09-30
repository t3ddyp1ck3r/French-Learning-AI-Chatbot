function sendMessage() {
    const userInput = document.getElementById("user_input").value;
    if (userInput.trim() === "") return;  

    const messageContainer = document.getElementById("messages");
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.textContent = userInput;
    messageContainer.appendChild(userMessage);

    messageContainer.scrollTop = messageContainer.scrollHeight;

    document.getElementById("user_input").value = "";

    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot");
    typingIndicator.textContent = "Typing...";
    typingIndicator.setAttribute("id", "typing-indicator");
    messageContainer.appendChild(typingIndicator);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => {
        console.log("Response received from backend:", response);
        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }
        return response.json();  
    })
    .then(data => {
        console.log("Parsed JSON data:", data);

        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }

        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.textContent = data.response;
        messageContainer.appendChild(botMessage);

        messageContainer.scrollTop = messageContainer.scrollHeight;
    })
    .catch(error => {
        console.error("Error occurred during fetch:", error);

        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }

        const errorMessage = document.createElement("div");
        errorMessage.classList.add("message", "bot");
        errorMessage.textContent = "Error: Unable to communicate with the chatbot server.";
        messageContainer.appendChild(errorMessage);

        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
}

document.getElementById("send_button").addEventListener("click", sendMessage);

document.getElementById("user_input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {  
        sendMessage();
    }
});

document.getElementById("clear_button").addEventListener("click", () => {
    fetch("http://127.0.0.1:5000/clear", {
        method: "POST"
    })
    .then(response => {
        if (response.ok) {
            document.getElementById("messages").innerHTML = "";  
            console.log("Chat history cleared successfully.");
        } else {
            console.error("Failed to clear chat history.");
        }
    })
    .catch(error => console.error("Error occurred while clearing chat history:", error));
});
