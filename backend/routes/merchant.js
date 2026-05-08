const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.fieldname + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// Get current merchant profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT m.id, m.owner_name, m.nic_number, m.phone, m.email, m.shop_name, m.shop_type, 
             m.registration_id, m.registration_date, m.license_url, m.description, m.business_description,
             m.address, m.area, m.district, m.tags, m.seating_availability, m.takeaway_availability, 
             m.delivery_availability, m.is_open, m.status, m.logo_url, m.cover_url, m.opening_time, 
             m.closing_time, m.working_days, m.created_at, c.whatsapp_number
             FROM Merchants m 
             LEFT JOIN MerchantContacts c ON m.id = c.merchant_id 
             WHERE m.id = ?`,
            [req.user.merchant.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Merchant not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update whatsapp number
router.post('/profile/whatsapp', auth, async (req, res) => {
    try {
        const { whatsapp_number } = req.body;
        const merchant_id = req.user.merchant.id;

        await pool.query(
            `INSERT INTO MerchantContacts (merchant_id, whatsapp_number) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE whatsapp_number = ?`,
            [merchant_id, whatsapp_number, whatsapp_number]
        );

        res.json({ success: true, message: 'WhatsApp number updated successfully' });
    } catch (error) {
        console.error('Update whatsapp error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update merchant profile
router.put('/profile', auth, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover', maxCount: 1 }, { name: 'license', maxCount: 1 }]), async (req, res) => {
    try {
        const {
            owner_name, phone, shop_name, shop_type, description, 
            address, area, district, tags, opening_time, closing_time, 
            working_days, seating_availability, takeaway_availability, delivery_availability,
            nic_number, registration_id, registration_date, business_description, is_open
        } = req.body;

        const merchant_id = req.user.merchant.id;

        // Fetch current profile to retain images if not updated
        const [current] = await pool.query('SELECT logo_url, cover_url, license_url FROM Merchants WHERE id = ?', [merchant_id]);
        if (current.length === 0) return res.status(404).json({ error: 'Merchant not found' });
        
        let logo_url = current[0].logo_url;
        let cover_url = current[0].cover_url;
        let license_url = current[0].license_url;

        if (req.files && req.files['logo']) {
            logo_url = `/uploads/${req.files['logo'][0].filename}`;
        }
        if (req.files && req.files['cover']) {
            cover_url = `/uploads/${req.files['cover'][0].filename}`;
        }
        if (req.files && req.files['license']) {
            license_url = `/uploads/${req.files['license'][0].filename}`;
        }

        let tagsJson = tags;
        if (tags) {
            try { tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags); } 
            catch (e) { tagsJson = current[0].tags; }
        }

        const updateQuery = `
            UPDATE Merchants SET 
                owner_name = ?, phone = ?, shop_name = ?, shop_type = ?, description = ?,
                address = ?, area = ?, district = ?, tags = ?, 
                opening_time = ?, closing_time = ?, working_days = ?,
                seating_availability = ?, takeaway_availability = ?, delivery_availability = ?,
                nic_number = ?, registration_id = ?, registration_date = ?, business_description = ?,
                is_open = ?, logo_url = ?, cover_url = ?, license_url = ?
            WHERE id = ?
        `;

        await pool.query(updateQuery, [
            owner_name, phone, shop_name, shop_type, description || null,
            address, area, district, tagsJson,
            opening_time || null, closing_time || null, working_days || null,
            seating_availability === 'true' || seating_availability === true ? 1 : 0, 
            takeaway_availability === 'true' || takeaway_availability === true ? 1 : 0, 
            delivery_availability === 'true' || delivery_availability === true ? 1 : 0,
            nic_number || null, registration_id || null, registration_date || null, business_description || null,
            is_open === 'true' || is_open === true ? 1 : 0, logo_url, cover_url, license_url,
            merchant_id
        ]);

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
