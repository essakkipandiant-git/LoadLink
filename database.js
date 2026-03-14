const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'loadlink.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create Loads Table
        db.run(`CREATE TABLE IF NOT EXISTS loads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            shop_name TEXT NOT NULL,
            contact_number TEXT NOT NULL,
            pickup_area TEXT NOT NULL,
            drop_area TEXT NOT NULL,
            goods_type TEXT NOT NULL,
            weight TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating loads table", err);
            }
        });

        // Create Vehicles Table
        db.run(`CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            driver_name TEXT NOT NULL,
            contact_number TEXT NOT NULL,
            vehicle_type TEXT NOT NULL,
            current_area TEXT NOT NULL,
            destination_area TEXT NOT NULL,
            available_time TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating vehicles table", err);
            }
        });

        // Create Users Table for Auth
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating users table", err);
            }
        });

        // Create Bookings Table matching users to posts
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_type TEXT NOT NULL, 
            post_id INTEGER NOT NULL,
            booker_id INTEGER NOT NULL,
            owner_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error("Error creating bookings table", err);
            }
        });
    }
});

module.exports = db;
