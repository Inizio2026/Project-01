const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all menu items for the logged in merchant
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM MenuItems WHERE merchant_id = ? ORDER BY created_at DESC',
            [req.user.merchant.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Fetch menu error:', error);
        res.status(500).json({ error: 'Server error fetching menu' });
    }
});

// Add a new menu item
router.post('/', [auth, upload.single('image')], async (req, res) => {
    try {
        const { item_name, category, price, stock, is_available, image_url: provided_url } = req.body;
        const merchant_id = req.user.merchant.id;
        const image_url = req.file ? `/uploads/${req.file.filename}` : (provided_url || null);
        
        const availability = is_available === 'false' || is_available === false ? 0 : 1;
        const stockValue = stock ? parseInt(stock, 10) : 0;

        const [result] = await pool.query(
            'INSERT INTO MenuItems (merchant_id, item_name, category, price, stock, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [merchant_id, item_name, category || null, price, stockValue, image_url, availability]
        );

        res.status(201).json({ message: 'Menu item added successfully', itemId: result.insertId, image_url });
    } catch (error) {
        console.error('Add menu error:', error);
        res.status(500).json({ error: 'Server error adding menu item' });
    }
});

// Update menu item availability or details
router.put('/:id', [auth, upload.single('image')], async (req, res) => {
    try {
        const { id } = req.params;
        const { item_name, category, price, stock, is_available, image_url: provided_url } = req.body;
        const merchant_id = req.user.merchant.id;

        // Ensure item belongs to merchant
        const [check] = await pool.query('SELECT id, image_url FROM MenuItems WHERE id = ? AND merchant_id = ?', [id, merchant_id]);
        if (check.length === 0) {
            return res.status(404).json({ error: 'Item not found or unauthorized' });
        }

        const availability = is_available === 'false' || is_available === false ? 0 : 1;
        const stockValue = stock !== undefined ? parseInt(stock, 10) : 0;

        // Determine image URL
        let final_image_url = check[0].image_url; // Default to existing
        if (req.file) {
            final_image_url = `/uploads/${req.file.filename}`;
        } else if (provided_url !== undefined) {
            final_image_url = provided_url || null; // Allow clearing or updating via URL
        }

        await pool.query(
            'UPDATE MenuItems SET item_name = ?, category = ?, price = ?, stock = ?, is_available = ?, image_url = ? WHERE id = ?',
            [item_name, category, price, stockValue, availability, final_image_url, id]
        );

        res.json({ message: 'Menu item updated successfully', image_url: final_image_url });
    } catch (error) {
        console.error('Update menu error:', error);
        res.status(500).json({ error: 'Server error updating menu item' });
    }
});

// Delete menu item
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const merchant_id = req.user.merchant.id;

        const [result] = await pool.query('DELETE FROM MenuItems WHERE id = ? AND merchant_id = ?', [id, merchant_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found or unauthorized' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Delete menu error:', error);
        res.status(500).json({ error: 'Server error deleting menu item' });
    }
});

module.exports = router;
