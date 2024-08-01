document.addEventListener('DOMContentLoaded', function() {
    const socket = io(); // Connect to the server using socket.io

    
    checkSession();

    // Show the authentication modal when the page loads
    const authModal = new bootstrap.Modal(document.getElementById('authModal'));
    authModal.show();

    function authenticateAdmin() {
        console.log('Attempting to authenticate admin using fingerprint...');
        socket.emit('authenticateAdmin'); // Emit the authenticateAdmin event to the server
    }

    // Automatically authenticate admin every 2 seconds
    setInterval(authenticateAdmin, 2000);

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


    function checkSession() {
        const isAuthenticated = sessionStorage.getItem('authenticated');
        if (isAuthenticated) {
            window.location.href = 'index.html'; // Redirect to index.html if already authenticated
        }
    }
});
