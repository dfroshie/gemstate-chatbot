const chatWindow = document.getElementById('chat-window');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    addMessage(message, 'user');
    messageInput.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message }),
        });
        const data = await response.json();
        addMessage(data.reply, 'bot');
    } catch (error) {
        addMessage('Sorry, something went wrong. Please try again.', 'bot');
    }
}
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});