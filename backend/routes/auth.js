const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// Merchant Registration
router.post('/register', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover', maxCount: 1 }, { name: 'license', maxCount: 1 }]), async (req, res) => {
    try {
        const {
            owner_name, phone, email, password, shop_name, shop_type,
            description, address, area, district, tags, seating,
            takeaway, delivery, opening_time, closing_time, working_days,
            nic_number, registration_id, registration_date, business_description
        } = req.body;

        // Check if email already exists
        const [existing] = await pool.query('SELECT id FROM Merchants WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Handle files
        const logo_url = req.files && req.files['logo'] ? `/uploads/${req.files['logo'][0].filename}` : null;
        const cover_url = req.files && req.files['cover'] ? `/uploads/${req.files['cover'][0].filename}` : null;
        const license_url = req.files && req.files['license'] ? `/uploads/${req.files['license'][0].filename}` : null;

        // Insert into database
        const query = `
            INSERT INTO Merchants (
                owner_name, phone, email, password_hash, shop_name, shop_type,
                description, address, area, district, tags, seating_availability,
                takeaway_availability, delivery_availability, status,
                opening_time, closing_time, working_days, logo_url, cover_url,
                nic_number, registration_id, registration_date, license_url, business_description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // Intentionally setting status 'approved' for MVP testing to simplify onboarding
        
        // Tags might come as stringified JSON from FormData
        let tagsJson = '[]';
        if (tags) {
            try {
                tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags);
            } catch (e) {
                tagsJson = '[]';
            }
        }

        const [result] = await pool.query(query, [
            owner_name, phone, email, password_hash, shop_name, shop_type,
            description, address, area, district, tagsJson,
            seating === 'true' || seating === true ? 1 : 0, 
            takeaway === 'true' || takeaway === true ? 1 : 0, 
            delivery === 'true' || delivery === true ? 1 : 0,
            opening_time || null, closing_time || null, working_days || null,
            logo_url, cover_url,
            nic_number || null, registration_id || null, registration_date || null, license_url, business_description || null
        ]);

        res.status(201).json({ message: 'Merchant registered successfully', merchantId: result.insertId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Merchant Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query('SELECT * FROM Merchants WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const merchant = rows[0];

        const isMatch = await bcrypt.compare(password, merchant.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        if (merchant.status === 'rejected') {
            return res.status(403).json({ error: 'Your account has been rejected' });
        }

        const payload = {
            merchant: {
                id: merchant.id,
                email: merchant.email,
                shop_name: merchant.shop_name
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretjwtkey_1234',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, merchant: { id: merchant.id, name: merchant.shop_name, status: merchant.status } });
            }
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
