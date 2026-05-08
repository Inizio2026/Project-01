const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get today's revenue
router.get('/revenue/today', auth, async (req, res) => {
    try {
        const merchant_id = req.user.merchant.id;
        
        // Fetch today's completed orders
        const [todayOrders] = await pool.query(
            `SELECT total_amount FROM Orders WHERE merchant_id = ? AND status = 'Completed' AND DATE(created_at) = CURDATE()`,
            [merchant_id]
        );
        
        // Fetch yesterday's completed orders for comparison
        const [yesterdayOrders] = await pool.query(
            `SELECT total_amount FROM Orders WHERE merchant_id = ? AND status = 'Completed' AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY`,
            [merchant_id]
        );

        const parseAmount = (val) => parseFloat(String(val || '0').replace(/[^0-9.-]+/g,"")) || 0;

        const todayRevenue = todayOrders.reduce((sum, o) => sum + parseAmount(o.total_amount), 0);
        const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + parseAmount(o.total_amount), 0);
        
        let revenueChange = 0;
        if (yesterdayRevenue === 0 && todayRevenue > 0) revenueChange = 100;
        else if (yesterdayRevenue > 0) revenueChange = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

        res.json({
            todayRevenue: todayRevenue,
            revenueChange: revenueChange
        });
    } catch (error) {
        console.error('Fetch today revenue error:', error);
        res.status(500).json({ error: 'Server error fetching revenue' });
    }
});

// Get all orders for logged in merchant
router.get('/', auth, async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const [orders] = await pool.query(
            'SELECT * FROM Orders WHERE merchant_id = ? ORDER BY created_at DESC',
            [req.user.merchant.id]
        );

        // Fetch items for each order
        for (let order of orders) {
            const [items] = await pool.query(
                `SELECT oi.id, oi.quantity, oi.price, m.item_name 
                 FROM OrderItems oi 
                 JOIN MenuItems m ON oi.menu_item_id = m.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ error: 'Server error fetching orders' });
    }
});

// Update order status (Accept Generate OTP, Reject, Complete)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const merchant_id = req.user.merchant.id;

        // Verify order belongs to merchant
        const [check] = await pool.query('SELECT id, status FROM Orders WHERE id = ? AND merchant_id = ?', [id, merchant_id]);
        if (check.length === 0) {
            return res.status(404).json({ error: 'Order not found or unauthorized' });
        }

        let updateQuery = 'UPDATE Orders SET status = ?';
        let queryParams = [status];
        let newOtp = null;

        // If Accept, generate OTP
        if (status === 'Accepted' && check[0].status === 'Pending') {
            newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
            updateQuery += ', otp_code = ?';
            queryParams.push(newOtp);
        }

        updateQuery += ' WHERE id = ? AND merchant_id = ?';
        queryParams.push(id, merchant_id);

        await pool.query(updateQuery, queryParams);

        res.json({ 
            message: `Order status updated to ${status}`, 
            otp_code: newOtp 
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Server error updating order status' });
    }
});

module.exports = router;
