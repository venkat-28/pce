/*
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const socket = io(); // Initialize socket.io client

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const userData = {
            fullname: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            password: document.getElementById('password').value
        };

        // Prompt user to place finger on fingerprint sensor
        alert('Place finger on fingerprint sensor. Awaiting confirmation...');

        // Emit user data to the server to register fingerprint and other details
        socket.emit('registerFingerprint', userData);

        // Handle the registration result from the server
        socket.on('registrationResult', function(data) {
            if (data.success) {
                alert('Registration successful!');
                window.location.href = 'index.html'; // Redirect to index page after successful registration
            } else {
                alert('Registration failed: ' + data.message); // Show error message from server
            }
        });
    });
});

*/

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const inputs = document.querySelectorAll('input');
    const socket = io(); // Assuming your server is set up to handle socket.io connections

    // Function to add validation listeners to each input
    function addValidationListeners(input) {
        input.addEventListener('input', function() {
            if (!input.validity.valid) {
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        input.addEventListener('blur', function() {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
            }
        });
    }

    inputs.forEach(addValidationListeners);

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        let isValid = true;

        // Check if all inputs are valid
        inputs.forEach(input => {
            if (!input.validity.valid) {
                input.classList.add('is-invalid');
                isValid = false;
            }
        });

        if (isValid) {
            const userData = {
                fullname: document.getElementById('fullName').value,
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                password: document.getElementById('password').value
            };

            alert('Place finger on fingerprint sensor. Awaiting confirmation...');

            // Emit user data to the server to register fingerprint and other details
            socket.emit('registerFingerprint', userData);

            // Setup to handle the registration result from the server
            setupRegistrationResultHandler();
        } else {
            // Focus the first invalid input
            inputs.forEach(input => {
                if (input.classList.contains('is-invalid')) {
                    input.focus();
                    return;
                }
            });
        }
    });

    function setupRegistrationResultHandler() {
        socket.off('registrationResult').on('registrationResult', function(data) {
            if (data.success) {
                alert('Registration successful!');
                window.location.href = 'index.html'; // Redirect to index page after successful registration
            } else {
                alert('Registration failed: ' + data.message); // Show error message from server
            }
        });
    }
});
