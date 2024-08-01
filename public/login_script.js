
document.addEventListener('DOMContentLoaded', function() {
    const socket = io(); // Connect to the server using socket.io

    const loginForm = document.getElementById('loginForm');
    const errorMessages = document.getElementById('errorMessages');

    // Function to update the error message display
    function updateErrorMessage(message) {
        errorMessages.textContent = message; // Display error message
        errorMessages.style.color = 'red'; // Make the text color red for visibility
    }
  // Prevent back navigation
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
      history.go(1);
  };

  
    // Handle the form submit event
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submit action

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Send login data to the server
        socket.emit('login', { username: username, password: password });

        // Handle login result from the server
        socket.on('loginResult', function(data) {
            if (data.success) {
                // Store the username in localStorage
                localStorage.setItem('username', data.username);
                // Redirect to another page if login is successful
                window.location.href = 'menu.html';
            } else {
                // Update the page with an error message if login fails
                updateErrorMessage(data.message);
            }
        });
    });
});