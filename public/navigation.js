document.addEventListener('DOMContentLoaded', function() {
    // Ensure the user is logged in
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            window.location.href = 'login.html'; // Redirect to login if not logged in
        }
    }

    // Check login status when the page loads
    checkLoginStatus();

    // Prevent forward and backward navigation using browser arrows
    window.addEventListener('popstate', function(event) {
        checkLoginStatus();
    });

    // Optional: Prevent the back button from navigating back to a cached page
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            checkLoginStatus();
        }
    });

    // Clear login status on logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
});
