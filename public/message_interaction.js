document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io.connect(); // Connect to the server

    // Retrieve message details from localStorage
    const message = JSON.parse(localStorage.getItem('messageDetails'));
    document.getElementById('messageTimestamp').textContent = message.timestamp;
    document.getElementById('messageContent').value = message.message;

    // Event listeners for Print, Delete, and Forward buttons
    document.getElementById('printBtn').addEventListener('click', () => {
        socket.emit('print', { message: message.message });
        window.close();
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
        socket.emit('delete_message', { id: message.id });
        socket.on('response', (response) => {
            if (response.success) {
                window.close();
            } else {
                console.error(response.message);
            }
        });
    });

    document.getElementById('forwardBtn').addEventListener('click', () => {
        localStorage.setItem('forwardMessage', message.message);
        window.location.href = 'compose.html';
    });
});
