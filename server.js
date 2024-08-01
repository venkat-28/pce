const express = require('express');
const http = require('http');
const os = require('os');
const path = require('path');
const session = require('express-session');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const db = require('./server/dbconnection');  // Import the database connection
const finger_register = require("./server/node_r503/command2.js");
const finger_authentication = require("./server/node_r503/authentication.js");
const crypto = require('crypto');
const { exec } = require('child_process');
// Import the UART socket handlers
const authMiddleware = require('./middleware/auth');
const bodyParser = require('body-parser');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
// Configure session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Route for login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Use authentication middleware for protected routes
app.use('/menu.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.use('/registration.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
});




// Import the UART socket handlers
const setupSocketHandlers = require('./server/uart.js');

// Setup socket handlers
setupSocketHandlers(io);

app.use(express.static('public'));
app.use(express.json()); // To parse JSON bodies

const adminPassword = "Admin@879"; // Constant admin password

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (let interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

const ipAddress = getLocalIpAddress();
const PORT = 3000;


// Function to check if Ethernet is up
const checkEthernetStatus = () => {
    const interfaces = os.networkInterfaces();
    let ethernetUp = false;

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
                ethernetUp = true;
            }
        }
    }

    return ethernetUp;
};

// Periodically check the Ethernet status and emit it to clients
setInterval(() => {
    const ethernetStatus = checkEthernetStatus();
    io.emit('ethernetStatus', ethernetStatus);
}, 5000); // Check every 5 seconds




io.on('connection', (socket) => {
    console.log('A client connected');
    socket.emit('ipAddress', { ip: ipAddress });

// Send the initial Ethernet status to the connected client
socket.emit('ethernetStatus', checkEthernetStatus());

   
socket.on('getSysDateTime', () => {
    const sysDateTime = new Date().toLocaleString();
    socket.emit('sysDateTime', sysDateTime);
});


       // Handle the request for key act date and time
       socket.on('requestKeyActDateTime', () => {
        // Fetch the key act date and time
        const keyActDateTime = new Date().toLocaleString(); // Example data, replace with actual logic

        // Send the key act date and time to the client
        socket.emit('keyActDateTime', keyActDateTime);
    });

    socket.on('requestKeyValidityDateTime', () => {
        const keyValidityDateTime = new Date().toLocaleString(); // Example data, replace with actual logic
        socket.emit('keyValidityDateTime', keyValidityDateTime);
    });

    socket.on('requestSystemStatus', () => {
        // Retrieve system information
        console.log('system status client connected');
        let losStatus = 'Off';
        let losStatus1 = 'Off';
        let pktLossStatus = 'Off';
        let trngStatus = 'Fail';
        let mtuSize = 'Unknown';
    
        // Check Loss of Signal lo
        exec("ethtool lo | grep 'Link detected'", (error, stdout, stderr) => {
            if (stdout.includes('yes')) {
                losStatus = 'On';
            
            }
            // Check Loss of Signal ethernet1
            exec("ethtool eno1 | grep 'Link detected'", (error, stdout, stderr) => {
                if (stdout.includes('yes')) {
                    losStatus1 = 'On';
                
                }
                    

            // Check Packet Loss
            exec("ping -c 100 -i 0.2 google.com", (error, stdout, stderr) => {
                if (stdout.includes('0% packet loss')) {
                    pktLossStatus = 'Off';
                } else {
                    pktLossStatus = 'On';
                }
    
                // Check TRNG Status
                exec("cat /dev/hwrng | od -N 8 -t u8", (error, stdout, stderr) => {
                    if (stdout.trim()) {
                        trngStatus = 'Pass';
                    }
    
                    // Get MTU Size
                    exec("ip link show eno1 | grep mtu", (error, stdout, stderr) => {
                        const mtuMatch = stdout.match(/mtu (\d+)/);
                        if (mtuMatch) {
                            mtuSize = mtuMatch[1];
                        }
    
                        // Prepare the system status information
                        const systemStatus = {
                            los: losStatus,
                            los1:losStatus1,
                            pktLoss: pktLossStatus,
                            trng: trngStatus,
                            mtu: mtuSize,
                            keyIntegrity: 'OK',
                            teleIntegrity: 'OK',
                            algoIntegrity: 'OK'
                        };
    
                        // Emit the system status to the frontend
                        socket.emit('systemStatus', systemStatus);
                    });
                });
            });
        });
    });
    });


    // Handle the request for set time
    socket.on('requestSetTime', () => {
        const setTime = new Date().toLocaleString(); // Example data, replace with actual logic
        socket.emit('setTime', setTime);
    });

        // Handle the request for key activation information
        socket.on('requestSetKeyAct', () => {
            const setKeyActInfo = 'Key Activation Info Example'; // Example data, replace with actual logic
            socket.emit('setKeyAct', setKeyActInfo);
        });

            // Handle the request for LCD authentication password
    socket.on('requestLcdAuthPw', () => {
        const lcdAuthPw = 'LCD Authentication Password Example'; // Example data, replace with actual logic
        socket.emit('lcdAuthPw', lcdAuthPw);
    });

        // Handle the request for LCD system password
        socket.on('requestLcdSysPw', () => {
            const lcdSysPw = 'LCD System Password Example'; // Example data, replace with actual logic
            socket.emit('lcdSysPw', lcdSysPw);
        });

            // Handle the request for LCD placeholder password
    socket.on('requestLcdPlPw', () => {
        const lcdPlPw = 'LCD Placeholder Password Example'; // Example data, replace with actual logic
        socket.emit('lcdPlPw', lcdPlPw);
    });

        // Handle the request for SNMP authentication password
        socket.on('requestSnmpAuthPw', () => {
            const snmpAuthPw = 'SNMP Authentication Password Example'; // Example data, replace with actual logic
            socket.emit('snmpAuthPw', snmpAuthPw);
        });

            // Handle the request for SNMP privacy password
    socket.on('requestSnmpPrivPw', () => {
        const snmpPrivPw = 'SNMP Privacy Password Example'; // Example data, replace with actual logic
        socket.emit('snmpPrivPw', snmpPrivPw);
    });

        // Handle the request for load algorithm key
        socket.on('requestLoadAlgoKey', () => {
            const loadAlgoKey = 'Load Algorithm Key Example'; // Example data, replace with actual logic
            socket.emit('loadAlgoKey', loadAlgoKey);
        });

            // Handle the request for system ID
    socket.on('requestSystemId', () => {
        const systemId = 'System ID Example'; // Example data, replace with actual logic
        socket.emit('systemId', systemId);
    });

        // Handle the request for system ID
        socket.on('requestSystemId', () => {
            const systemId = 'System ID Example'; // Example data, replace with actual logic
            socket.emit('systemId', systemId);
        });

          // Handle the request for PI checksum
    socket.on('requestPiChecksum', () => {
        const piChecksum = 'PI Checksum Example'; // Example data, replace with actual logic
        socket.emit('piChecksum', piChecksum);
    });

        // Handle the request for algorithm checksum
        socket.on('requestAlgoChecksum', () => {
            const algoChecksum = 'Algorithm Checksum Example'; // Example data, replace with actual logic
            socket.emit('algoChecksum', algoChecksum);
        });

            // Handle the request for active key information
    socket.on('requestActiveKey', () => {
        const activeKey = 'Active Key Example'; // Example data, replace with actual logic
        socket.emit('activeKey', activeKey);
    });

      // Handle the request for buffer key information
      socket.on('requestBufferKey', () => {
        const bufferKey = 'Buffer Key Example'; // Example data, replace with actual logic
        socket.emit('bufferKey', bufferKey);
    });

    



        // Handle password check
        socket.on('checkPassword', (inputPassword) => {
            if (inputPassword === adminPassword) {
                socket.emit('passwordResult', true);
            } else {
                socket.emit('passwordResult', false);
            }
        });





    socket.on('adminLogin', (loginData) => {
        const username = loginData.username;
        const password = crypto.createHash('md5').update(loginData.password).digest('hex');

        // Check if the username is 'admin'
        if (username === 'admin') {
            db.get("SELECT username FROM users WHERE username=? AND password=?", [username, password], function(err, data) {
                if (err) {
                    console.log(err);
                    socket.emit('adminLoginResult', { success: false, message: "Internal error" });
                } else {
                    if (data) {
                        socket.emit('adminLoginResult', { success: true, message: "Successfully authenticated" });
                    } else {
                        socket.emit('adminLoginResult', { success: false, message: "Incorrect password" });
                    }
                }
            });
        } else {
            socket.emit('adminLoginResult', { success: false, message: "Invalid username" });
        }
    });

// Fingerprint authentication for admin user only
socket.on('authenticateAdmin', async () => {
    await finger_register();
    db.get("SELECT hashcode FROM users WHERE username = 'admin'", async (err, data) => {
        if (err) {
            socket.emit('authenticationResult', { success: false, message: "Some internal server error" });
        } else {
            if (data && data.hashcode) {
                const auth = await finger_authentication(data.hashcode);
                if (auth) {
                    socket.emit('authenticationResult', { success: true, message: "Admin successfully authenticated" });
                } else {
                    socket.emit('authenticationResult', { success: false, message: "Bio Metric unmatched/Not Available" });
                }
            } else {
                socket.emit('authenticationResult', { success: false, message: "Admin user not found" });
            }
        }
    });
});

        /* 
     // Admin login logic
     socket.on('adminLogin', async (loginData) => {
        const username = loginData.username;
        const password = crypto.createHash('md5').update(loginData.password).digest('hex');

        if (username === 'admin') {
            db.get("SELECT hashcode FROM users WHERE username=? AND password=?", [username, password], async function(err, data) {
                if (err) {
                    console.log(err);
                    socket.emit('adminLoginResult', { success: false, message: "Internal error" });
                } else {
                    if (data) {
                        const auth = await finger_authentication(data.hashcode);
                        if (auth) {
                            socket.emit('adminLoginResult', { success: true, message: "Successfully authenticated" });
                        } else {
                            socket.emit('adminLoginResult', { success: false, message: "Fingerprint verification failed" });
                        }
                    } else {
                        socket.emit('adminLoginResult', { success: false, message: "Incorrect password" });
                    }
                }
            });
        } else {
            socket.emit('adminLoginResult', { success: false, message: "Invalid username" });
        }
    });
 */
        // Fingerprint authentication across all users
    socket.on('authenticateUser', async () => {
        await finger_register();
        db.all("SELECT hashcode FROM users", async (err, data) => {
            if (err) {
                socket.emit('authenticationResult', { success: false, message: "Some internal server error" });
            } else {
                for (let index = 0; index < data.length; index++) {
                    if (data[index].hashcode) {
                        const auth = await finger_authentication(data[index].hashcode);
                        if (auth) {
                            socket.emit('authenticationResult', { success: true, message: "Successfully authenticated" });
                            return;
                        }
                    }
                }
                socket.emit('authenticationResult', { success: false, message: "Bio Metric unmatched/Not Available" });
            }
        });
    });






    // Fingerprint registration
    socket.on('registerFingerprint', async (userData) => {
        
        //var finger_data = await finger_register();
        //console.log(finger_data);
        //var finger_data = await finger_register();
        //console.log(finger_data);
        if (userData.username && userData.fullname && userData.password && userData.email && userData.phoneNumber ) {
        //if (userData.username && userData.fullname && userData.password && userData.email && userData.phoneNumber && finger_data) {
            var username = userData.username;
            var fullname = userData.fullname;
            var password = crypto.createHash('md5').update(userData.password).digest('hex');
            var email = userData.email;
            var phno = userData.phoneNumber;

            db.all("SELECT * FROM users WHERE username=?", [username], function(err, data) {
                if (err) {
                    console.log(err);
                    socket.emit('registrationResult', { success: false, message: "Internal error" });
                } else {
                    if (data.length > 0) {
                        socket.emit('registrationResult', { success: false, message: "User already exists" });
                    } else {
                        db.run("INSERT INTO users (fullname, username, password, email, phno) VALUES (?, ?, ?, ?, ?)", [fullname, username, password, email, phno], function(err) {
                        /*db.run("INSERT INTO users (fullname, username, password, email, phno, hashcode) VALUES (?, ?, ?, ?, ?, ?)", [fullname, username, password, email, phno, finger_data], function(err) {*/
                            if (err) {
                                console.log(err);
                                socket.emit('registrationResult', { success: false, message: "Internal error" });
                            } else {
                                socket.emit('registrationResult', { success: true, message: "Successfully registered" });
                            }
                        });
                    }
                }
            });
        } else {
            socket.emit('registrationResult', { success: false, message: "Data in wrong format" });
        }
    });

    
/*********************************************************************************************************************/ 
    // User login
    socket.on('login', (loginData) => {
        console.log('user authentication started');
        var usrid = loginData.username;
        var password = crypto.createHash('md5').update(loginData.password).digest('hex');
        db.get("SELECT hashcode FROM users WHERE username=? AND password=?", [usrid, password], function(err, data) {
            if (err) {
                console.log(err);
                socket.emit('loginResult', { success: false, message: "Internal error" });
            } else {
                if (data) {
                    socket.emit('loginResult', { success: true, message: "Successfully authenticated", username: usrid });
                } else {
                    socket.emit('loginResult', { success: false, message: "Authentication failed" });
                }
            }
        });
    });
    
});


server.listen(PORT, ipAddress, () => {
    console.log(`Server running at http://${ipAddress}:${PORT}/`);
});

