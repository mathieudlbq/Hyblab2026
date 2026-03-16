'use strict';
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        // Enable WAL mode for better concurrency (multiple readers, one writer)
        db.run('PRAGMA journal_mode = WAL');
        // Increase busy timeout to wait if the database is locked
        db.run('PRAGMA busy_timeout = 5000');
    }
});

module.exports = db;
