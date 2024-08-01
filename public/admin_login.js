
/*
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('admin-login-form');
    const passwordInput = document.getElementById('admin-password');
    const verifyFingerprintButton = document.getElementById('verify-fingerprint');
    const adminCorrectPassword = 'Admin@879';
    let fingerprintVerified = false; // This will be used to check the fingerprint verification

    // Stub function for fingerprint verification (to be implemented)
    verifyFingerprintButton.addEventListener('click', function() {
        console.log('Fingerprint verification initiated.');
        // Here you will integrate the actual fingerprint verification logic
        fingerprintVerified = true; // Assuming fingerprint is successfully verified for now
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const adminPassword = passwordInput.value;
        
        // Check if both password is correct and fingerprint is verified
        if (adminPassword === adminCorrectPassword && fingerprintVerified) {
            window.location.href = 'user_registration.html'; // Redirect to user registration page
        } else {
            // If the password or fingerprint verification fails
            if (adminPassword !== adminCorrectPassword) {
                alert('Incorrect admin password.');
            }
            if (!fingerprintVerified) {
                alert('Fingerprint verification required.');
            }
        }
    }); 
});
*/
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('admin-login-form');
    const passwordInput = document.getElementById('admin-password');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const adminPassword = passwordInput.value;
        /*
        // Alert the user to place their finger on the sensor
        alert('Please place your finger on the sensor.');
*/
        // Send the admin password to the server using socket.io
        const socket = io();
        socket.emit('adminLogin', { username: 'admin', password: adminPassword });

        // Handle server response
        socket.on('adminLoginResult', function(result) {
            if (result.success) {
                //window.location.href = 'admin_fingerprint.html'; 
                window.location.href = 'user_registration.html'; // Redirect to user registration page
            } else {
                alert(result.message);
            }
        });
    });
});
