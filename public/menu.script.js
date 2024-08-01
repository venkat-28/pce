
document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io.connect(); // Connect to the server

  

    let currentSection = 'inboxContent'; // Variable to track the current section

    // Display timestamp
    const timestamp = new Date().toLocaleString();
    document.getElementById('timestamp').textContent = timestamp;

  // Fetch and display the username from localStorage
  const username1 = localStorage.getItem('username');
  if (username1) {
      document.getElementById('username').textContent = username1;
  } else {
      // Handle the case where the username is not available (e.g., redirect to login page)
      window.location.href = 'login.html';
  }
    // Add event listener for the logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Clear the username from localStorage
        localStorage.removeItem('username');
        // Redirect to login page
        window.location.href = 'index.html';
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

    const container1 = document.getElementById('container1');
    const container2 = document.getElementById('container2');

    // Function to show only one content section at a time
    const showOnlyContent = (contentId) => {
        const contents = [
            'inboxContent', 'outboxContent', 'composeContent', 'messageDetailsContent',
            'sysDateTimeContent', 'keyActDateTimeContent', 'keyValidityDateTimeContent', 'systemStatusContent',
            'setTimeContent','setKeyActContent',
            'lcdAuthPwContent', 'lcdSysPwContent', 'lcdPlPwContent', 'snmpAuthPwContent', 'snmpPrivPwContent', 
            'loadalgokeyContent',
            'fetchingMessage',
            'setsystemidContent','getsystemidContent',
            'pichecksumContent','algochecksumContent','activekeyContent','bufferkeyContent',
            'validTunnelContent', 'getValidTunnelContent',
            'tunnelSetContent','setipv4Content','setipv6Content',
            'removeTunnelContent','singletunnelContent','alltunnelContent',
            'networkParametersContent','setedmip-encContent','setedmip-decContent','getedmip-encContent','getedmip-decContent'
            
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
                `;
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
    toggleContent('pinboxBtn', 'inboxContent');
    toggleContent('poutboxBtn', 'outboxContent');

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

    // Listen for 'ethernetStatus' event from the server
    socket.on('ethernetStatus', (isConnected) => {
        updateEthernetStatus(isConnected);
    });

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
/****************************************************************************************************************** */
    // Show message buttons in container2 when message button is clicked
    $('#messageBtn').on('click', function() {
        hideAllContainers();
        $('#container2').show();
        $('#messageButtons').show();
        $('#systemidButtons').hide();

        // Resize container1 (e.g., reduce its width)
        container1.style.width = '30%'; // Adjust width as needed
    });

    $('#exitmessageBtn').on('click', function() {
        location.reload();
        hideAllContainers();
        // Resize container1 back to original size
        container1.style.width = '100%'; // Adjust width as needed
    });

/************************************************************************************************************** */

    $('#printButton').on('click', function() {
        hideAllContainers();
        $('#container2').show();
        $('#printButtons').show();
        // Resize container1 (e.g., reduce its width)
        container1.style.width = '30%'; // Adjust width as needed
    });

    $('#exitprintBtn').on('click', function() {
        hideAllContainers();
        // Resize container1 back to original size
        container1.style.width = '100%'; // Adjust width as needed
    });


/************************************************************************************************************** */
    // New functionality for "Get Date & Time" button
    $('#getDateTimeBtn').on('click', function() {

        hideAllContainers();
        $('#getDateTimeButtons').show();
        $('#container2').show();
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
    // Show the content
    $('#keyActDateTimeContent').show();
    showOnlyContent('keyActDateTimeContent');

    // Emit an event to request key act date and time
    socket.emit('requestKeyActDateTime');
});

// Handle receiving the date and time information
socket.on('keyActDateTime', function(data) {
    // Update the content with the received data
    $('#keyActDateTimeContent').html(`<h3>Key Act Date and Time:</h3><p> ${data} </p>`);
});


// Handle the keyValidityDateTimeBtn button click
$('#keyValidityDateTimeBtn').on('click', function() {
    $('#container2').show();
    $('#keyValidityDateTimeContent').show();
    showOnlyContent('keyValidityDateTimeContent');
    socket.emit('requestKeyValidityDateTime');
});

socket.on('keyValidityDateTime', function(data) {
    $('#keyValidityDateTimeContent').text(`Key Validity Date and Time: ${data}`);
});

    $('#exitdtBtn').on('click', function() {
        hideAllContainers();
    });


/**************************************************************************************************** */



    // New functionality for "System Info" button
    $('#systemInfoBtn').on('click', function() {
        hideAllContainers();
        $('#systemInfoButtons').show();
        $('#container2').show();
    });


// Handle the systemStatusBtn button click
$('#systemStatusBtn').on('click', function() {
    $('#systemStatusContent').hide(); // Initially hide the content 
    $('#fetchingMessage').show(); // Show the fetching message
    showOnlyContent('fetchingMessage');
   
    /* showOnlyContent('systemStatusContent');  */
     socket.emit('requestSystemStatus');
});

/// Handle receiving the system status
socket.on('systemStatus', function(data) {
    console.log('system status Data receiving started');


        // Hide the fetching message and show the content
        $('#fetchingMessage').hide();
        $('#systemStatusContent').show();
        $('#systemStatusContent').empty();
        $('#systemStatusContent').html(`
        <div id="systemStatusDetails">
            <p>LOS Plain: ${data.los}</p>
            <p>LOS Crypto: ${data.los1}</p>
            <p>Packet Loss (CS): ${data.pktLoss}</p>
            <p>Packet Loss (MS): ${data.pktLoss}</p>
            <p>TRNG Status: ${data.trng}</p>
            <p>MTU Size: ${data.mtu}</p>
            <p>Key Integrity: ${data.keyIntegrity}</p>
            <p>Tele Integrity: ${data.teleIntegrity}</p>
            <p>Algo Integrity: ${data.algoIntegrity}</p>
        </div>
        <button id="systemStatusContentbackBtn" class="btn btn-secondary mt-2 systemStatusContentbackBtn">Back</button>

    `);
});


$(document).on('click', '#systemStatusContentbackBtn', function() {
    $('#systemStatusContent').hide(); // Hide the system status content
});

    $('#exitSystemInfoBtn').on('click', function() {
        hideAllContainers();
    });



/********************************************************************************************************************** */

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

    // Show modal on Change Password button click
    $('#cfdaldauthBtn').on('click', function() {
        currentAuthRequest = 'CFDALDAUTH'; // Track the current authentication request
        $('#authModal').modal('show');
    });

    // Handle Submit button click in modal
    $('#submitAuth').on('click', function() {
        const username = localStorage.getItem('username');
        console.log(username);

        const password = $('#authPassword').val();
        //const inputPassword = $('#authPassword').val();
        // Simulate socket communication for password verification
        //socket.emit('checkPassword', inputPassword);
        socket.emit('login', { username: username, password: password });
       // socket.on('passwordResult', function(isMatch) {
        socket.on('loginResult', function(data) {
            console.log('user authentication result recived');
            if (data.success) {
                $('#authModal').modal('hide');
                if (currentAuthRequest === 'setDateTime') {
                    $('#container2').show();
                    $('#messageButtons, #printButtons, #changePasswordButtons, #getDateTimeButtons, #systemInfoButtons, #cfdaldauthButtons, #tunnelConfigurationButtons,#systemidButtons').hide();
                    $('#dateTimeButtons').show();
                } else if (currentAuthRequest === 'changePassword') {
                    $('#container2').show();
                    $('#messageButtons, #dateTimeButtons, #getDateTimeButtons, #systemInfoButtons, #cfdaldauthButtons, #printButtons, #tunnelConfigurationButtons,#systemidButtons').hide();
                    $('#changePasswordButtons').show();
                } else if (currentAuthRequest === 'CFDALDAUTH') {
                    $('#container2').show();
                    $('#messageButtons, #dateTimeButtons, #getDateTimeButtons, #systemInfoButtons, #changePasswordButtons, #printButtons, #tunnelConfigurationButtons,#systemidButtons').hide();
                    $('#cfdaldauthButtons').show();
                } //        $('#messageButtons, #dateTimeButtons, #getDateTimeButtons, #systemInfoButtons, #changePasswordButtons, #printButtons, #cfdaldauthButtons, #tunnelConfigurationButtons,#systemidButtons').hide();

            } else {
                alert('Incorrect password. Please try again.');
            }
        });
    });

/******************************************************************** */
// Handle the setTimeBtn button click
$('#setTimeBtn').on('click', function() {
    $('#setTimeContent').show();
    showOnlyContent('setTimeContent');
    socket.emit('requestSetTime');
});

// Handle receiving the set time information
socket.on('setTime', function(data) {
    $('#setTimeContent').text(`Set Time: ${data}`);
});


// Handle the setKeyActBtn button click
$('#setKeyActBtn').on('click', function() {
    $('#setKeyActContent').show();
    showOnlyContent('setKeyActContent');
    socket.emit('requestSetKeyAct');
});

// Handle receiving the key activation information
socket.on('setKeyAct', function(data) {
    $('#setKeyActContent').text(`Key Activation Info: ${data}`);
});


    // Handle Exit button click for Set Date & Time
    $('#exitBtn').on('click', function() {
        hideAllContainers();
    });
/********************************************************************** */
    // Handle Exit button click for Change Password
    $('#exitPwBtn').on('click', function() {
        hideAllContainers();
    });

    // Handle button clicks in Change Password section
    $('#lcdAuthPwBtn').on('click', function() {
        $('#lcdAuthPwContent').show();
        showOnlyContent('lcdAuthPwContent');
        socket.emit('requestLcdAuthPw');
    });
    
    // Handle receiving the LCD authentication password information
    socket.on('lcdAuthPw', function(data) {
        $('#lcdAuthPwContent').text(`LCD Authentication Password: ${data}`);
    });

    $('#lcdSysPwBtn').on('click', function() {
        $('#lcdSysPwContent').show();
        showOnlyContent('lcdSysPwContent');
        socket.emit('requestLcdSysPw');
    });
    
    // Handle receiving the LCD system password information
    socket.on('lcdSysPw', function(data) {
        $('#lcdSysPwContent').text(`LCD System Password: ${data}`);
    });

 // Handle the lcdPlPwBtn button click
$('#lcdPlPwBtn').on('click', function() {
    $('#lcdPlPwContent').show();
    showOnlyContent('lcdPlPwContent');
    socket.emit('requestLcdPlPw');
});

// Handle receiving the LCD placeholder password information
socket.on('lcdPlPw', function(data) {
    $('#lcdPlPwContent').text(`LCD Placeholder Password: ${data}`);
});

// Handle the snmpAuthPwBtn button click
$('#snmpAuthPwBtn').on('click', function() {
    $('#snmpAuthPwContent').show();
    showOnlyContent('snmpAuthPwContent');
    socket.emit('requestSnmpAuthPw');
});

// Handle receiving the SNMP authentication password information
socket.on('snmpAuthPw', function(data) {
    $('#snmpAuthPwContent').html(`SNMP Authentication Password: <strong>${data}</strong>`);
});

// Handle the snmpPrivPwBtn button click
$('#snmpPrivPwBtn').on('click', function() {
    $('#snmpPrivPwContent').show();
    showOnlyContent('snmpPrivPwContent');
    socket.emit('requestSnmpPrivPw');
});

// Handle receiving the SNMP privacy password information
socket.on('snmpPrivPw', function(data) {
    $('#snmpPrivPwContent').html(`SNMP Privacy Password: <strong>${data}</strong>`);
});



/**************************************************************************************** */

    // Handle cfd ald buttons
    $('#loadalgokeybtn').on('click', function() {
        $('#loadalgokeyContent').show();
        showOnlyContent('loadalgokeyContent');
        socket.emit('requestLoadAlgoKey');
    });
    
    // Handle receiving the load algorithm key information
    socket.on('loadAlgoKey', function(data) {
        $('#loadalgokeyContent').html(`Load Algorithm Key: <strong>${data}</strong>`);
    });

    $('#exitcfdBtn').on('click', function() {
        hideAllContainers();
    });
/******************************************************************************************************************************/


// handle system id button 

$('#systemidBtn').on('click', function() {
    hideAllContainers();
    $('#systemidButtons').show();
    $('#container2').show();
});

// Handle the setsystemidbtn button click
$('#setsystemidbtn').on('click', function() {
    $('#setsystemidContent').html('<h3>System ID</h3>'); // Display HTML content
    showOnlyContent('setsystemidContent');
    // If you need to request additional data from the server
    socket.emit('requestSystemId');
});

// Handle receiving the system ID information
socket.on('systemId', function(data) {
    $('#setsystemidContent').append(`<p>System ID: <strong>${data}</strong></p>`);
});



// Handle the getsystemidbtn button click
$('#getsystemidbtn').on('click', function() {
    $('#getsystemidContent').html('<h3>get system id</h3>'); // Display HTML content
    showOnlyContent('getsystemidContent');
    // If you need to request additional data from the server
    socket.emit('requestSystemId');
});

// Handle receiving the system ID information
socket.on('systemId', function(data) {
    $('#getsystemidContent').append(`<p>System ID: <strong>${data}</strong></p>`);
});

$('#exitsystemidBtn').on('click', function() {
    hideAllContainers();
});


/*************************************************************************/


//handle tunnel configuration buttons

    $('#tunnelconfigurationBtn').on('click', function() {
        hideAllContainers();
        $('#tunnelConfigurationButtons').show();
        $('#container2').show();
    });


//handle valid tunnel button    
$('#validTunnelsBtn').on('click', function() {
    $('#tunnelSetContent,#removeTunnelContent,#networkParametersContent').hide();
    $('#container3').show();
    $('#validTunnelContent').show();
    //showOnlyContent('validTunnelContent');
    //$('#getValidTunnelgetbackBtn,#setipv4Btn,#setipv6Btn,#exittunnelsetBtn,#setipv4backBtn,#setipv6backBtn,#singletunnelBtn,#').hide();

});

// $('#getValidTunnelBtn').on('click', function() {
//     $('#container3').show();
//     $('#getValidTunnelContent').html("<h3>Tunnels are running</h3>");
//     showOnlyContent('getValidTunnelContent');
// });


$('#getValidTunnelBtn').on('click', function() {
   // hideAllContainers();
    $('#container3').show();
    $('#getValidTunnelContent').html(`
        <h3> Valid Tunnels </h3>
        <button id="getValidTunnelgetbackBtn" class="btn btn-secondary mt-2 getValidTunnelgetbackBtn">Back</button>
    `);
    showOnlyContent('getValidTunnelContent');

    // Add event listener for the Back button
    document.getElementById('getValidTunnelgetbackBtn').addEventListener('click', () => {
        $('#getValidTunnelContent').hide();
        $('#validTunnelContent').show();
    });


});


$('#exitValidTunnelBtn').on('click', function() {
    //hideAllContainers();
    $('#getValidTunnelContent').hide();
    $('#validTunnelContent').hide();
    $('#tunnelConfigurationButtons').show();
    $('#container2').show();

});
 

// handle tunnel set buttons

$('#tunnelSetBtn').on('click', function() {
    $('#validTunnelContent,#removeTunnelContent,#networkParametersContent ').hide();
    
    $('#container3').show();
    $('#tunnelSetContent').show();
});

// handle set ipv4 button
$('#setipv4Btn').on('click', function() {
    $('#container3').show();
    $('#setipv4Content').html(`
        <h3>set IPv4</h3>
        <button id="setipv4backBtn" class="btn btn-secondary mt-2 setipv4backBtn">Back</button>
    `);
    showOnlyContent('setipv4Content');

    // Add event listener for the Back button
    document.getElementById('setipv4backBtn').addEventListener('click', () => {
        $('#setipv4Content').hide();
        $('#tunnelSetContent').show();
    });


});


// handle set ipv6 button
$('#setipv6Btn').on('click', function() {
    $('#container3').show();
    $('#setipv6Content').html(`
        <h3>set IPv6</h3>
        <button id="setipv6backBtn" class="btn btn-secondary mt-2 setipv6backBtn">Back</button>
    `);
    showOnlyContent('setipv6Content');

    // Add event listener for the Back button
    document.getElementById('setipv6backBtn').addEventListener('click', () => {
        $('#setipv6Content').hide();
        $('#tunnelSetContent').show();
    });


});

// handle exittunnelset 
$('#exittunnelsetBtn').on('click', function() {
    //hideAllContainers();
    $('#tunnelSetContent').hide();
    $('#setipv4Content').hide();
    $('#setipv6Content').hide();
    $('#tunnelConfigurationButtons').show();
    $('#container2').show();

});
 

// handle remove tunnel buttons
$('#removeTunnelBtn').on('click', function() {
    $('#validTunnelContent,#tunnelSetContent,#networkParametersContent ').hide();

    $('#container3').show();
    $('#removeTunnelContent').show();
});

// handle single tunnel button

$('#singletunnelBtn').on('click', function() {
    $('#container3').show();
    $('#singletunnelContent').html(`
        <h3>enter tunnel number</h3>
        <input type="text" id="tunnelNumberInput" class="form-control mt-2" placeholder="Enter tunnel number">
        <div class="button-container mt-2">
        <button id="singletunnelRemoveBtn" class="btn btn-secondary singletunnelRemoveBtn">Remove</button>
        <button id="singletunnelbackBtn" class="btn btn-secondary singletunnelbackBtn">Back</button>
    </div>
    `);
    showOnlyContent('singletunnelContent');

    // Add event listener for the Back button
    document.getElementById('singletunnelbackBtn').addEventListener('click', () => {
        $('#singletunnelContent').hide();
        $('#removeTunnelContent').show();
    });

       // Add event listener for the Remove button
       document.getElementById('singletunnelRemoveBtn').addEventListener('click', () => {
        const tunnelNumber = document.getElementById('tunnelNumberInput').value;
        if (tunnelNumber.trim() === '') {
            alert('Please enter a tunnel number before removing.');
        } else {
            alert(`Tunnel removed successfully ${tunnelNumber}`);
            document.getElementById('tunnelNumberInput').value = '';
        }
    });


});


// handle all tunnel button

$('#alltunnelBtn').on('click', function() {
    alert("All tunnels are removed successfully");
  /*  
    $('#container3').show();
    $('#alltunnelContent').html(`
    <h3> All tunnels are removed successfully</h3>
        <button id="alltunnelbackBtn" class="btn btn-secondary mt-2 alltunnelbackBtn">Back</button>
    `);
    showOnlyContent('alltunnelContent');

    // Add event listener for the Back button
    document.getElementById('alltunnelbackBtn').addEventListener('click', () => {
        $('#alltunnelContent').hide();
        $('#removeTunnelContent').show();
    });
*/

});



// handle exitremovetunnelBtn
$('#exitremovetunnelBtn').on('click', function() {
    //hideAllContainers();
    $('#removeTunnelContent').hide();
    $('#singletunnelContent').hide();
    $('#alltunnelContent').hide();
    $('#tunnelConfigurationButtons').show();
    $('#container2').show();

});


// handle networkParameters button 

$('#networkParametersBtn').on('click', function() {
    $('#validTunnelContent,#tunnelSetContent,#removeTunnelContent ').hide();    
    $('#container3').show();
    $('#networkParametersContent').show();
});


// handle set edmip-enc button
$('#setedmip-encBtn').on('click', function() {
    $('#container3').show();
    $('#setedmip-encContent').html(`
   
    <div class="button-container mt-2">
    <button id="setipv-4encBtn" class="btn btn-secondary  setipv-4encBtn">Set IPv_4 ENC</button>
    <button id="setipv-6encBtn" class="btn btn-secondary  setipv-4encBtn">Set IPv_6 ENC</button>
    </div>
    

    <button id="setedmip-encbackBtn" class="btn btn-secondary mt-2 setedmip-encbackBtn">Back</button>
    `);
    showOnlyContent('setedmip-encContent');

    // Add event listener for the Back button
    document.getElementById('setedmip-encbackBtn').addEventListener('click', () => {
        $('#setedmip-encContent').hide();
        $('#networkParametersContent').show();
    });


});

// handle set edmip-dec button
$('#setedmip-decBtn').on('click', function() {
    $('#container3').show();
    $('#setedmip-decContent').html(`
   
    <div class="button-container mt-2">
    <button id="setipv-4decBtn" class="btn btn-secondary  setipv-4decBtn">Set IPv_4 DEC</button>
    <button id="setipv-6decBtn" class="btn btn-secondary  setipv-4decBtn">Set IPv_6 DEC</button>
    </div>
    

    <button id="setedmip-decbackBtn" class="btn btn-secondary mt-2 setedmip-decbackBtn">Back</button>
    `);
    showOnlyContent('setedmip-decContent');

    // Add event listener for the Back button
    document.getElementById('setedmip-decbackBtn').addEventListener('click', () => {
        $('#setedmip-decContent').hide();
        $('#networkParametersContent').show();
    });


});


// handle get edmip-enc button
$('#getedmip-encBtn').on('click', function() {
    $('#container3').show();
    $('#getedmip-encContent').html(`
   
    <div class="button-container mt-2">
    <button id="showipv-4encBtn" class="btn btn-secondary showipv-4encBtn">Show IPv_4 ENC</button>
    <button id="showipv-6encBtn" class="btn btn-secondary showipv-4encBtn">Show IPv_6 ENC</button>
    </div>
    

    <button id="getedmip-encbackBtn" class="btn btn-secondary mt-2 getedmip-encbackBtn">Back</button>
    `);
    showOnlyContent('getedmip-encContent');

    // Add event listener for the Back button
    document.getElementById('getedmip-encbackBtn').addEventListener('click', () => {
        $('#getedmip-encContent').hide();
        $('#networkParametersContent').show();
    });


});



// handle get edmip-dec button
$('#getedmip-decBtn').on('click', function() {
    $('#container3').show();
    $('#getedmip-decContent').html(`
   
    <div class="button-container mt-2">
    <button id="showipv-4decBtn" class="btn btn-secondary showipv-4decBtn">Show IPv_4 ENC</button>
    <button id="showipv-6decBtn" class="btn btn-secondary showipv-4decBtn">Show IPv_6 ENC</button>
    </div>
    

    <button id="getedmip-decbackBtn" class="btn btn-secondary mt-2 getedmip-decbackBtn">Back</button>
    `);
    showOnlyContent('getedmip-decContent');

    // Add event listener for the Back button
    document.getElementById('getedmip-decbackBtn').addEventListener('click', () => {
        $('#getedmip-decContent').hide();
        $('#networkParametersContent').show();
    });


});

// handle exitremovetunnelBtn
$('#exitnetworkParametersBtn').on('click', function() {
    //hideAllContainers();
    $('#networkParametersContent').hide();
    $('#setedmip-encContent').hide();
    $('#setedmip-decContent').hide();
    $('#getedmip-encContent').hide();
    $('#getedmip-decContent').hide();

    $('#tunnelConfigurationButtons').show();
    $('#container2').show();

});

// handle of exitTunnelBtn


$('#exitTunnelBtn').on('click', function() {
    hideAllContainers();
});

/*******************************************************************************************************************************************************************/

// handle checksum button

$('#checksumBtn').on('click', function() {
    hideAllContainers();
    $('#checksumButtons').show();
    $('#container2').show();
});


// Handle the pichecksumbtn button click
$('#pichecksumbtn').on('click', function() {
    $('#pichecksumContent').show();
    showOnlyContent('pichecksumContent');
    // Emit event to request PI checksum
    socket.emit('requestPiChecksum');
});

// Handle receiving the PI checksum information
socket.on('piChecksum', function(data) {
    $('#pichecksumContent').html(`PI Checksum: <strong>${data}</strong>`);
});


// Handle the algochecksumbtn button click
$('#algochecksumbtn').on('click', function() {
    $('#algochecksumContent').show();
    showOnlyContent('algochecksumContent');
    // Emit event to request algorithm checksum
    socket.emit('requestAlgoChecksum');
});

// Handle receiving the algorithm checksum information
socket.on('algoChecksum', function(data) {
    $('#algochecksumContent').html(`Algorithm Checksum: <strong>${data}</strong>`);
});



// Handle the activekeybtn button click
$('#activekeybtn').on('click', function() {
    $('#activekeyContent').show();
    showOnlyContent('activekeyContent');
    // Emit event to request active key information
    socket.emit('requestActiveKey');
});

// Handle receiving the active key information
socket.on('activeKey', function(data) {
    $('#activekeyContent').html(`Active Key: <strong>${data}</strong>`);
});

$// Handle the bufferkeybtn button click
$('#bufferkeybtn').on('click', function() {
    $('#bufferkeyContent').show();
    showOnlyContent('bufferkeyContent');
    // Emit event to request buffer key information
    socket.emit('requestBufferKey');
});

// Handle receiving the buffer key information
socket.on('bufferKey', function(data) {
    $('#bufferkeyContent').html(`Buffer Key: <strong>${data}</strong>`);
});


$('#exitchecksumBtn').on('click', function() {
    hideAllContainers();
});



/********************************************************************************************** */
    // Function to hide all containers
    function hideAllContainers() {
        $('#container2').hide();
       //$('#container3').hide();
        // $('#container4').hide();
        $('#messageButtons, #dateTimeButtons, #getDateTimeButtons, #systemInfoButtons, #changePasswordButtons, #printButtons, #cfdaldauthButtons, #tunnelConfigurationButtons,#systemidButtons,#checksumButtons').hide();
        $('#inboxContent, #outboxContent, #composeContent, #messageDetailsContent, #sysDateTimeContent, #keyActDateTimeContent, #keyValidityDateTimeContent, #systemStatusContent, #setTimeContent, #setKeyActContent, #lcdAuthPwContent, #lcdSysPwContent, #lcdPlPwContent, #snmpAuthPwContent, #snmpPrivPwContent, #loadalgokeyContent, #setsystemidContent,#getsystemidContent, #validTunnelContent, #pichecksumContent, #algochecksumContent, #activekeyContent ,#bufferkeyContent,  #getValidTunnelContent,#tunnelSetContent,#setipv4Content,#setipv6Content ,#removeTunnelContent, #singletunnelContent , #alltunnelContent,#networkParametersContent,  #setedmip-encContent , #setedmip-decContent ,#getedmip-encContent ,#getedmip-decContent,#fetchingMessage').hide();
    }

    function hidelevel3containers()
    {
        //$('#container2').hide();
        $('#validTunnelContent,#tunnelSetContent,#removeTunnelContent,#networkParametersContent , ').hide();
        $('#').hide();


    }


   
});