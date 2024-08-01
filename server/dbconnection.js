

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./messages.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender TEXT,
        ip_address TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_type INTEGER
    )`, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Created the messages table");
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS uart_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        timestamp TEXT,
        message_type INTEGER,
        device_name TEXT
    )`, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Created the UART messages table");
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        date_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fullname VARCHAR(45) DEFAULT NULL,
        email VARCHAR(45) DEFAULT NULL,
        phno VARCHAR(15) DEFAULT NULL,
        hashcode BLOB,
        PRIMARY KEY (username)
    )`, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully created users table");
        }
    });
});

module.exports = db;
