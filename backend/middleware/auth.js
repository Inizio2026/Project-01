const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (token == null) return res.status(401).json({ error: 'Null token' });

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_1234', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token is invalid or expired' });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
