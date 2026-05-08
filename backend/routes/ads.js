const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// Create Ad Request
router.post('/', [auth, upload.single('banner')], async (req, res) => {
    try {
        const { title, duration_days, notes } = req.body;
        const merchant_id = req.user.merchant.id;
        const banner_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await pool.query(
            'INSERT INTO AdRequests (merchant_id, title, duration_days, notes, banner_url) VALUES (?, ?, ?, ?, ?)',
            [merchant_id, title, duration_days, notes, banner_url]
        );

        res.status(201).json({ message: 'Ad Request created successfully', adId: result.insertId });
    } catch (error) {
        console.error('Create ad request error:', error);
        res.status(500).json({ error: 'Server error creating ad request' });
    }
});

// Get Ad Requests
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM AdRequests WHERE merchant_id = ? ORDER BY created_at DESC',
            [req.user.merchant.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Fetch ad requests error:', error);
        res.status(500).json({ error: 'Server error fetching ad requests' });
    }
});

// Delete ad request
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const merchant_id = req.user.merchant.id;
        const [result] = await pool.query('DELETE FROM AdRequests WHERE id = ? AND merchant_id = ?', [id, merchant_id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Ad request not found or unauthorized' });
        res.json({ message: 'Ad request deleted successfully' });
    } catch (error) {
        console.error('Delete ad request error:', error);
        res.status(500).json({ error: 'Server error deleting ad request' });
    }
});

module.exports = router;
