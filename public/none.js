document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io.connect(); // Connect to the server

    let currentSection = 'inboxContent'; // Variable to track the current section

    // Display timestamp
    const timestamp = new Date().toLocaleString();
    document.getElementById('timestamp').textContent = timestamp;



    // Fetch and display the username from localStorage
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    } else {
        // Handle the case where the username is not available (e.g., redirect to login page)
        window.location.href = 'login.html';
    }

 // Add event listener for the logout button
 document.getElementById('logoutBtn').addEventListener('click', () => {
    // Clear the user me from localStorage
    localStorage.removeItem('username');
    // Redirect to login page
    window.location.href = 'login.html';
});




 // Toggle container2 visibility
 document.getElementById('messageBtn').addEventListener('click', () => {
    const container2 = document.getElementById('container2');
    const container3 = document.getElementById('container3');

    if (container2.style.display === 'none') {
        container2.style.display = 'block';
    } else {
        container2.style.display = 'none';
        container3.style.display = 'none';
        showOnlyContent(''); // Hide any content in container3
    }
});


    // Function to show only one content section at a time
    const showOnlyContent = (contentId) => {
        const contents = [
            'inboxContent', 'outboxContent', 'composeContent', 'messageDetailsContent',
            'sysDateTimeContent', 'keyActDateTimeContent', 'keyValidityDateTimeContent', 'systemStatusContent',
            'lcdAuthPwContent', 'lcdSysPwContent', 'lcdPlPwContent', 'snmpAuthPwContent', 'snmpPrivPwContent'
        ];
        contents.forEach(id => {
            document.getElementById(id).style.display = id === contentId ? 'block' : 'none';
        });
        currentSection = contentId; // Update the current section
    };

    // Fetch messages for Inbox and Outbox
    const fetchMessages = () => {
        socket.emit('get_messages', {});
    };

    // Handle response to get_messages event
    socket.on('response', (response) => {
        if (response.success && response.data) {
            const inboxContent = document.getElementById('inboxContent');
            const outboxContent = document.getElementById('outboxContent');

            inboxContent.innerHTML = `
            <h3>Inbox</h3><table class="table"><tbody></tbody></table>
            <div class="close-btn-container">
                <button id="closeInboxBtn" class="btn btn-secondary btn-small">Close</button>
            </div>`;
        outboxContent.innerHTML = `
            <h3>Outbox</h3><table class="table"><tbody></tbody></table>
            <div class="close-btn-container">
                <button id="closeOutboxBtn" class="btn btn-secondary btn-small">Close</button>
            </div>`;
            const inboxBody = inboxContent.querySelector('tbody');
            const outboxBody = outboxContent.querySelector('tbody');

            response.data.inbox.forEach(msg => {
                const row = document.createElement('tr');
                row.innerHTML = `<td><a href="#" class="message-link" data-id="${msg.id}" data-timestamp="${msg.timestamp}" data-message="${msg.message}">${formatTimestamp(msg.timestamp)}</a></td>`;
                inboxBody.appendChild(row);
            });

            response.data.sent.forEach(msg => {
                const row = document.createElement('tr');
                row.innerHTML = `<td><a href="#" class="message-link" data-id="${msg.id}" data-timestamp="${msg.timestamp}" data-message="${msg.message}">${formatTimestamp(msg.timestamp)}</a></td>`;
                outboxBody.appendChild(row);
            });
            setupCloseButtons(); // Setup close buttons after creating the content
 
        } else {
            console.error(response.message);
        }
    });

    // Toggle content visibility in container3
    const toggleContent = (buttonId, contentId) => {
        const button = document.getElementById(buttonId);
        button.addEventListener('click', () => {
            const container3 = document.getElementById('container3');
            container3.style.display = 'block';
            showOnlyContent(contentId);
            fetchMessages(); // Fetch messages when toggling between Inbox and Outbox
            if (contentId === 'composeContent' && document.getElementById(contentId).style.display === 'block') {
                document.getElementById(contentId).innerHTML = `
                <h3>Compose Message</h3>
                <textarea id="messageInput" class="form-control" rows="9"></textarea>
                <div style="margin-top: 10px;">
                      <button id="sendBtn" class="btn btn-primary" style="width: 100px; height: 35px; margin-right: 10px;">Send</button>
                      <button id="closeComposeBtn" class="btn btn-secondary" style="width: 100px; height: 35px; margin-right: 10px;">Close</button>
           </div>
            `
                setupSendButton();
                setupCloseButtons(); // Setup close button after creating the content
 
            } else if (contentId === 'composeContent') {
                document.getElementById(contentId).innerHTML = '';
            }
        });
    };

    toggleContent('inboxBtn', 'inboxContent');
    toggleContent('outboxBtn', 'outboxContent');
    toggleContent('composeBtn', 'composeContent');

 // Setup close buttons for third container sections
const setupCloseButtons = () => {
    const closeInboxBtn = document.getElementById('closeInboxBtn');
    if (closeInboxBtn) {
        closeInboxBtn.addEventListener('click', () => {
            document.getElementById('container3').style.display = 'none';
            showOnlyContent('');
        });
    }

    const closeOutboxBtn = document.getElementById('closeOutboxBtn');
    if (closeOutboxBtn) {
        closeOutboxBtn.addEventListener('click', () => {
            document.getElementById('container3').style.display = 'none';
            showOnlyContent('');
        });
    }

    const closeComposeBtn = document.getElementById('closeComposeBtn');
    if (closeComposeBtn) {
        closeComposeBtn.addEventListener('click', () => {
            document.getElementById('container3').style.display = 'none';
            showOnlyContent('');
        });
    }
};




    // Update Ethernet status indicator
    const updateEthernetStatus = (connected) => {
        const statusIndicator = document.getElementById('statusIndicator');
        if (connected) {
            statusIndicator.classList.add('connected');
        } else {
            statusIndicator.classList.remove('connected');
        }
    };

    // Example: Update status based on backend data (simulated with setTimeout)
    setTimeout(() => {
        // Simulate backend call to check IP address
        const isConnected = true; // Change this based on actual backend response
        updateEthernetStatus(isConnected);
    }, 1000);

    // Fetch and display message details
    document.getElementById('container3').addEventListener('click', (event) => {
        if (event.target.classList.contains('message-link')) {
            event.preventDefault();
            const messageId = event.target.getAttribute('data-id');
            const messageTimestamp = event.target.getAttribute('data-timestamp');
            const messageContent = event.target.getAttribute('data-message');

            const messageDetailsContent = document.getElementById('messageDetailsContent');
            messageDetailsContent.innerHTML = `
                <div id="messageDetailsContainer">
                    <h2>Message Details</h2>
                    <p><strong>Timestamp:</strong> ${formatTimestamp(messageTimestamp)}</p>
                    <p><strong>Message:</strong></p>
                    <textarea class="form-control" rows="5" readonly>${messageContent}</textarea>
                    <button id="printBtn" class="btn btn-primary mt-2">Print</button>
                    <button id="deleteBtn" class="btn btn-danger mt-2" data-id="${messageId}">Delete</button>
                    <button id="forwardBtn" class="btn btn-info mt-2">Forward</button>
                    <button id="closeBtn" class="btn btn-secondary mt-2">Close</button>
                </div>
            `;
            showOnlyContent('messageDetailsContent');

            // Event listeners for Print, Delete, Forward, and Close buttons
            document.getElementById('printBtn').addEventListener('click', () => {
                const message = {
                    // device_name: 'Generic Device', // Add appropriate device name if needed
                    timestamp: messageTimestamp,
                    message: messageContent
                };
                socket.emit('print', message);
            });

            document.getElementById('deleteBtn').addEventListener('click', () => {
                const messageId = document.getElementById('deleteBtn').getAttribute('data-id');
                socket.emit('delete_message', { id: messageId });
            });

            document.getElementById('forwardBtn').addEventListener('click', () => {
                const composeContent = document.getElementById('composeContent');
                composeContent.innerHTML = `
                    <h3>Compose Message</h3>
                    <textarea id="messageInput" class="form-control" rows="9">${messageContent}</textarea>
                    <div style="margin-top: 10px;">
                    <button id="sendBtn" class="btn btn-primary" style="width: 100px; height: 35px; margin-right: 10px;">Send</button>
                    <button id="closeComposeBtn" class="btn btn-secondary" style="width: 100px; height: 35px;">Close</button>
                   </div>
                `;
                messageDetailsContent.style.display = 'none';
                showOnlyContent('composeContent');
                setupSendButton();
                setupCloseButtons(); // Setup close button after creating the content

            });
            document.getElementById('closeBtn').addEventListener('click', () => {
                messageDetailsContent.style.display = 'none';
            });
            document.getElementById('closeMessageDetailsBtn').addEventListener('click', () => {
                document.getElementById('container3').style.display = 'none';
                showOnlyContent('');
            });
        }
    });

    // Handle response for delete message
    socket.on('delete_response', (response) => {
        if (response.success) {
            alert('Message deleted successfully');
            fetchMessages(); // Refresh messages after deletion
            // Hide the message details and show the previous section
            showOnlyContent(currentSection); // Return to the section that was active before the delete
           document.getElementById('container3').style.display = 'block'; // Ensure container3 is visible

        } else {
            console.error(response.message);
        }
    });

    // Handle response for print message
    socket.on('printStatus', (response) => {
        if (response.success) {
            alert('Print job sent to server successfully');
        } else {
            alert('Failed to send print job to server');
        }
    });

    // Helper function to set up send button
    function setupSendButton() {
        document.getElementById('sendBtn').addEventListener('click', () => {
            const message = document.getElementById('messageInput').value;
            socket.emit('send_message', { message });
            document.getElementById('composeContent').innerHTML = '';
            document.getElementById('composeContent').style.display = 'none';
            alert('New message sent');
            fetchMessages(); // Refresh messages after sending a new message
        });
    }

    // Listen for new messages from the server
    socket.on('new_message', (message) => {
        if (message.type === 1) { // Only show alert for incoming messages
            alert('New message received');
        }
        fetchMessages(); // Refresh messages when a new message is received
    });

    // Helper function to format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
    }

    // Initial fetch of messages
    fetchMessages();

    // Add new functionality

    // Show message buttons in container2 when message button is clicked
    $('#messageBtn').on('click', function() {
        hideAllContainers();
        $('#container2').show();
        $('#messageButtons').show();
    });

    $('#exitmessageBtn').on('click', function() {
        hideAllContainers();
    });
    
    // New functionality for "Get Date & Time" button
    $('#getDateTimeBtn').on('click', function() {
        hideAllContainers();
        $('#getDateTimeButtons').show();
        $('#container2').show();
    });

    // New functionality for "System Info" button
    $('#systemInfoBtn').on('click', function() {
        hideAllContainers();
        $('#systemInfoButtons').show();
        $('#container2').show();
    });



  // Show modal on Set Date & Time button click
  $('#setDateTimeBtn').on('click', function() {
    currentAuthRequest = 'setDateTime'; // Track the current authentication request
    $('#authModal').modal('show');
});

// Show modal on Change Password button click
$('#changePasswordBtn').on('click', function() {
    currentAuthRequest = 'changePassword'; // Track the current authentication request
    $('#authModal').modal('show');
});

// Handle Submit button click in modal
$('#submitAuth').on('click', function() {
    const inputPassword = $('#authPassword').val();
    // Simulate socket communication for password verification
    socket.emit('checkPassword', inputPassword);
    socket.on('passwordResult', function(isMatch) {
        if (isMatch) {
            $('#authModal').modal('hide');
            if (currentAuthRequest === 'setDateTime') {
                $('#container2').show();
                $('#messageButtons, #changePasswordButtons, #getDateTimeButtons, #systemInfoButtons').hide();
                $('#dateTimeButtons').show();
            } else if (currentAuthRequest === 'changePassword') {
                $('#container2').show();
                $('#messageButtons, #dateTimeButtons, #getDateTimeButtons, #systemInfoButtons').hide();
                $('#changePasswordButtons').show();
            }
        } else {
            alert('Incorrect password. Please try again.');
        }
    });
});

// Handle Exit button click for Set Date & Time
$('#exitBtn').on('click', function() {
    hideAllContainers();
});

// Handle Exit button click for Change Password
$('#exitPwBtn').on('click', function() {
    hideAllContainers();
});

 
    // Handle button clicks in Change Password section
    $('#lcdAuthPwBtn').on('click', function() {
        $('#lcdAuthPwContent').show();
        showOnlyContent('lcdAuthPwContent');
    });

    $('#lcdSysPwBtn').on('click', function() {
        $('#lcdSysPwContent').show();
        showOnlyContent('lcdSysPwContent');
    });

    $('#lcdPlPwBtn').on('click', function() {
        $('#lcdPlPwContent').show();
        showOnlyContent('lcdPlPwContent');
    });

    $('#snmpAuthPwBtn').on('click', function() {
        $('#snmpAuthPwContent').show();
        showOnlyContent('snmpAuthPwContent');
    });

    $('#snmpPrivPwBtn').on('click', function() {
        $('#snmpPrivPwContent').show();
        showOnlyContent('snmpPrivPwContent');
    });

    // Fetch system date and time from server using socket
    $('#sysDateTimeBtn').on('click', function() {
        $('#sysDateTimeContent').show();
        socket.emit('getSysDateTime');
    });

    socket.on('sysDateTime', function(data) {
        $('#sysDateTimeContent').html(`<h3>System Date & Time</h3><p>${data}</p>`);
        showOnlyContent('sysDateTimeContent');
    });

    $('#keyActDateTimeBtn').on('click', function() {
        $('#keyActDateTimeContent').show();
        showOnlyContent('keyActDateTimeContent');
    });

    $('#keyValidityDateTimeBtn').on('click', function() {
        $('#keyValidityDateTimeContent').show();
        showOnlyContent('keyValidityDateTimeContent');
    });
    
    $('#exitdtBtn').on('click', function() {
        hideAllContainers();
    });

    $('#systemStatusBtn').on('click', function() {
        $('#systemStatusContent').show();
        showOnlyContent('systemStatusContent');
    });

    $('#exitSystemInfoBtn').on('click', function() {
        hideAllContainers();
    });

    // Function to hide all containers
    function hideAllContainers() {
        $('#container2').hide();
        $('#messageButtons, #dateTimeButtons, #getDateTimeButtons, #systemInfoButtons, #changePasswordButtons').hide();
        $('#inboxContent, #outboxContent, #composeContent, #messageDetailsContent, #sysDateTimeContent, #keyActDateTimeContent, #keyValidityDateTimeContent, #systemStatusContent, #lcdAuthPwContent, #lcdSysPwContent, #lcdPlPwContent, #snmpAuthPwContent, #snmpPrivPwContent').hide();
    }
    
});
