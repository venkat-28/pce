document.addEventListener('DOMContentLoaded', function() {
    const socket = io(); // Connect to the server using socket.io

    // Element references
    const scanButton = document.getElementById('scanBtn');
    const registerButton = document.getElementById('registerBtn');

    // Check session on page load to prevent unauthorized access
    checkSession();

    // Show the authentication modal when the page loads
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();

    // Event listener for the scan button
    scanButton.addEventListener('click', function() {
        console.log('Attempting to authenticate using fingerprint...');
        window.location.href = 'login.html';
        //socket.emit('authenticateUser'); // Emit the authenticate event to the server
    });

    // Function to handle authentication
/*    function authenticate() {
        console.log('Attempting to authenticate using fingerprint...');
        socket.emit('authenticateUser'); // Emit the authenticate event to the server
    }

    // Automatically authenticate every 2 seconds
    setInterval(authenticate, 2000);

*/


  // Prevent back navigation
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
      history.go(1);
  };
  
    // Handle authentication results from the server
    socket.on('authenticationResult', function(data) {
        if (data.success) {
            console.log(data.message);
            // Save session on successful authentication
            sessionStorage.setItem('authenticated', 'true');
            window.location.href = 'login.html'; // Redirect to login.html if authentication is successful
        } else {
            alert(data.message); // Show an alert if authentication fails
        }
    });

    // Event listener for the register button
    registerButton.addEventListener('click', function() {
        window.location.href = 'admin_login.html'; // Navigate to admin_login.html for new user registration
    });

    function checkSession() {
        const isAuthenticated = sessionStorage.getItem('authenticated');
        if (isAuthenticated) {
            window.location.href = 'index.html'; // Redirect to index.html if already authenticated
        }
    }
});


/*
scanButton.addEventListener('click', function() {
        console.log('Attempting to authenticate using fingerprint...');
        //window.location.href = 'login.html';
        socket.emit('authenticateUser'); // Emit the authenticate event to the server
    });

    // Handle authentication results from the server
    socket.on('authenticationResult', function(data) {
        if (data.success) {
            console.log(data.message);
            // Save session on successful authentication
            sessionStorage.setItem('authenticated', 'true');
            window.location.href = 'login.html'; // Redirect to login.html if authentication is successful
        } else {
            alert(data.message); // Show an alert if authentication fails
        }
    });

*/