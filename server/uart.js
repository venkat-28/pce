const express = require("express"),
    router = express.Router(),
    db = require("./dbconnection.js");
const { SerialPort } = require('serialport');
const dgram = require('dgram');
const uartPortName = '/dev/ttyUSB0';
const uartBaudRate = 115200;
const udpSocket = dgram.createSocket('udp4');
const os = require('os');
const exec = require('child_process').exec;
const fs = require('fs');
const { Delimiter } = require('@serialport/parser-delimiter');
const { ReadlineParser } = require('@serialport/parser-readline'); // Correct import for ReadlineParser
const localIp = Object.values(os.networkInterfaces())
    .flat()
    .filter((iface) => iface.family === 'IPv4' && !iface.internal)
    .map((iface) => iface.address)[0];

const uartPort = new SerialPort({
    path: uartPortName,
    baudRate: uartBaudRate,
    autoOpen: false
});

const parser = uartPort.pipe(new ReadlineParser({ delimiter: '$' })); // Correct usage of ReadlineParser
uartPort.open((err) => {
    if (err) {
        console.error('Error opening UART port:', err.message);
    } else {
        console.log(`UART port ${uartPortName} opened successfully`);
    }
});

uartPort.on('error', (err) => {
    console.error('UART error:', err.message);
});

uartPort.on('data', (data) => {
    const message = data.toString();
    console.log(`Received message from UART: ${message}`);

    const timestamp = convertUTCtoIST(new Date());
    const message_type = 1; // Received message

    db.run(`INSERT INTO uart_messages (message, timestamp, message_type, device_name) VALUES (?, ?, ?, ?)`,
        [message, timestamp, message_type, uartPortName], (err) => {
            if (err) {
                console.error('Error inserting received message into database:', err.message);
            } else {
                console.log('Received message stored in database');
                io.emit('new_message', { message: message, type: message_type }); // Notify clients of the new message
            }
        });
});

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('user connected');

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('print', (data) => {
            console.log('Print request received:', data);

            // Example: Print the message details
            const printDetails = `Timestamp: ${new Date(data.timestamp).toLocaleString('en-IN')}\nMessage: ${data.message}`;
            console.log(printDetails);

            // Write the message details to a text file
            const filePath = './print_details.txt';
            fs.writeFile(filePath, printDetails, (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                    socket.emit('printStatus', { success: false });
                    return;
                }

                // Execute the lp command to print the file
                const printCommand = `lp -d Generic_POS_Printer ${filePath}`;
                console.log(printCommand);
                exec(printCommand, (err, stdout, stderr) => {
                    if (err || stderr) {
                        console.error('Error executing print command:', err || stderr);
                        socket.emit('printStatus', { success: false });
                        return;
                    }

                    console.log('Print job sent to printer successfully');
                    socket.emit('printStatus', { success: true });
                });
            });
        });

        socket.on('delete_message', (data) => {
            const { id } = data;
            db.run(`DELETE FROM uart_messages WHERE id = ?`, [id], function (err) {
                if (err) {
                    console.error('Error deleting message from database:', err);
                    socket.emit('delete_response', response(false, "unsuccessful", null));
                } else {
                    console.log(`Message with ID ${id} deleted from database`);
                    socket.emit('delete_response', response(true, "Message deleted successfully", null));
                }
            });
        });

        socket.on('get_messages', (data) => {
            var data = {
                inbox: null,
                sent: null,
            };
            db.all("SELECT * FROM uart_messages WHERE message_type = 1", (err, rows) => {
                if (err) {
                    console.log(err);
                    socket.emit('response', response(false, "can't fetch inbox", null));
                } else {
                    db.all("SELECT * FROM uart_messages WHERE message_type = 2", (err, rows1) => {
                        if (err) {
                            console.log(err);
                            socket.emit('response', response(false, "can't fetch sent", null));
                        } else {
                            data.inbox = rows;
                            data.sent = rows1;
                            socket.emit('response', response(true, "success", data));
                        }
                    });
                }
            });
        });

        socket.on('send_message', (data) => {
            if (data.message) {
                if (!uartPort.isOpen) {
                    socket.emit('response', response(false, 'UART port is not open', null));
                } else {
                    const message = data.message;
                    uartPort.write(message, (err) => {
                        if (err) {
                            console.error('Error sending message over UART:', err.message);
                            socket.emit('response', response(false, 'Error sending message over UART', null));
                        } else {
                            console.log(`Message sent over UART: ${message}`);

                            const timestamp = convertUTCtoIST(new Date());
                            const message_type = 2; // Sent message

                            db.run(`INSERT INTO uart_messages (message, timestamp, message_type, device_name) VALUES (?, ?, ?, ?)`,
                                [message, timestamp, message_type, uartPortName], (err) => {
                                    if (err) {
                                        console.error('Error inserting message into database:', err.message);
                                        socket.emit('response', response(false, 'Error storing message in database', null));
                                    } else {
                                        console.log('Message stored in database');
                                        socket.emit('response', response(true, "successfully sent", null));
                                        io.emit('new_message', { message: message, type: message_type }); // Notify clients of the new message
                                    }
                                });
                        }
                    });
                }
            } else {
                socket.emit('response', response(false, "data is in wrong format", null));
            }
        });
    });
}

function convertUTCtoIST(date) {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().replace('Z', ''); // Remove 'Z' to store in local time
}

function response(success, message, data) {
    return { success: success, message: message, data: data }
}

module.exports = setupSocketHandlers;
