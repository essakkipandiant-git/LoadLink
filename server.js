const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the same directory
app.use(express.static(__dirname));

// --- AUTH ROUTES ---
app.post('/api/register', (req, res) => {
    const { name, mobile, password, role } = req.body;
    if (!name || !mobile || !password || !role) return res.status(400).json({ error: 'All fields required' });

    // Note: In production, password should be hashed with bcrypt!
    db.run(`INSERT INTO users (name, mobile, password, role) VALUES (?, ?, ?, ?)`, 
        [name, mobile, password, role], 
        function(err) {
            if (err) {
                if(err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Mobile number already registered.'});
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'success', user: { id: this.lastID, name, mobile, role } });
        }
    );
});

app.post('/api/login', (req, res) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

    db.get(`SELECT id, name, mobile, role FROM users WHERE mobile = ? AND password = ?`, 
        [mobile, password], 
        (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });
            res.json({ message: 'success', user });
        }
    );
});

// --- API ROUTES ---

// Get all loads
app.get('/api/loads', (req, res) => {
    db.all('SELECT * FROM loads ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'success', data: rows });
    });
});

// Create new load
app.post('/api/loads', (req, res) => {
    const { user_id, shop_name, contact_number, pickup_area, drop_area, goods_type, weight, preferred_time } = req.body;
    
    if (!user_id || !shop_name || !contact_number || !pickup_area || !drop_area) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO loads (user_id, shop_name, contact_number, pickup_area, drop_area, goods_type, weight, preferred_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [user_id, shop_name, contact_number, pickup_area, drop_area, goods_type, weight, preferred_time];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'success',
            data: { id: this.lastID, ...req.body }
        });
    });
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
    db.all('SELECT * FROM vehicles ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'success', data: rows });
    });
});

// Create new vehicle
app.post('/api/vehicles', (req, res) => {
    const { user_id, driver_name, contact_number, vehicle_type, current_area, destination_area, available_time, notes } = req.body;
    
    if (!user_id || !driver_name || !contact_number || !vehicle_type || !current_area || !destination_area) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO vehicles (user_id, driver_name, contact_number, vehicle_type, current_area, destination_area, available_time, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [user_id, driver_name, contact_number, vehicle_type, current_area, destination_area, available_time, notes];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: 'success',
            data: { id: this.lastID, ...req.body }
        });
    });
});

// Delete a load (owner only)
app.delete('/api/loads/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const rawUid = req.body && req.body.user_id != null ? req.body.user_id : req.query.user_id;
    const user_id = parseInt(rawUid, 10);

    if (isNaN(user_id)) return res.status(400).json({ error: 'valid user_id required' });

    db.get('SELECT user_id FROM loads WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Load not found' });
        if (parseInt(row.user_id) !== user_id) return res.status(403).json({ error: 'Not authorized' });

        db.run('DELETE FROM loads WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'success' });
        });
    });
});

// Delete a vehicle (owner only)
app.delete('/api/vehicles/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const rawUid = req.body && req.body.user_id != null ? req.body.user_id : req.query.user_id;
    const user_id = parseInt(rawUid, 10);

    if (isNaN(user_id)) return res.status(400).json({ error: 'valid user_id required' });

    db.get('SELECT user_id FROM vehicles WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Vehicle not found' });
        if (parseInt(row.user_id) !== user_id) return res.status(403).json({ error: 'Not authorized' });

        db.run('DELETE FROM vehicles WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'success' });
        });
    });
});

// --- USER DASHBOARD ROUTES ---
app.get('/api/user/:id/posts', (req, res) => {
    const userId = req.params.id;
    let results = { loads: [], vehicles: [] };

    db.all('SELECT * FROM loads WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, loadRows) => {
        if (err) return res.status(500).json({ error: err.message });
        results.loads = loadRows.map(l => ({...l, _type: 'load'}));

        db.all('SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, vehicleRows) => {
            if (err) return res.status(500).json({ error: err.message });
            results.vehicles = vehicleRows.map(v => ({...v, _type: 'vehicle'}));

            res.json({ message: 'success', data: [...results.loads, ...results.vehicles].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) });
        });
    });
});

// --- BOOKING ROUTES ---
app.post('/api/book', (req, res) => {
    const { post_type, post_id, booker_id, owner_id } = req.body;
    if (!post_type || !post_id || !booker_id || !owner_id) return res.status(400).json({ error: 'Missing required fields' });

    const sql = `INSERT INTO bookings (post_type, post_id, booker_id, owner_id) VALUES (?, ?, ?, ?)`;
    db.run(sql, [post_type, post_id, booker_id, owner_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', booking_id: this.lastID });
    });
});

app.get('/api/user/:id/bookings', (req, res) => {
    const userId = req.params.id;
    // Get bookings where this user is the OWNER of the post (incoming requests)
    const incomingSql = `
        SELECT b.*, u.name as requestor_name, u.mobile as requestor_mobile 
        FROM bookings b 
        JOIN users u ON b.booker_id = u.id 
        WHERE b.owner_id = ? ORDER BY b.created_at DESC`;

    db.all(incomingSql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// Fallback to index.html for other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
