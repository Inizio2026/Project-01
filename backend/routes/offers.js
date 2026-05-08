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

// Get active offers
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Offers WHERE merchant_id = ? ORDER BY created_at DESC',
            [req.user.merchant.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Fetch offers error:', error);
        res.status(500).json({ error: 'Server error fetching offers' });
    }
});

// Create new offer
router.post('/', [auth, upload.single('banner')], async (req, res) => {
    try {
        const { title, description, start_date, end_date } = req.body;
        const merchant_id = req.user.merchant.id;
        const banner_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await pool.query(
            'INSERT INTO Offers (merchant_id, title, description, start_date, end_date, banner_url) VALUES (?, ?, ?, ?, ?, ?)',
            [merchant_id, title, description, start_date, end_date, banner_url]
        );

        res.status(201).json({ message: 'Offer created successfully', offerId: result.insertId });
    } catch (error) {
        console.error('Create offer error:', error);
        res.status(500).json({ error: 'Server error creating offer' });
    }
});

// Delete offer
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const merchant_id = req.user.merchant.id;
        const [result] = await pool.query('DELETE FROM Offers WHERE id = ? AND merchant_id = ?', [id, merchant_id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Offer not found or unauthorized' });
        res.json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Delete offer error:', error);
        res.status(500).json({ error: 'Server error deleting offer' });
    }
});

module.exports = router;
