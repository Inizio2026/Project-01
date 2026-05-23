const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRouter = require('./routes/auth');
const merchantRouter = require('./routes/merchant');
const menuRouter = require('./routes/menu');
const orderRouter = require('./routes/orders');
const offerRouter = require('./routes/offers');
const adsRouter = require('./routes/ads');

// Use Routes
app.use('/api/auth', authRouter);
app.use('/api/merchant', merchantRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', orderRouter);
app.use('/api/offers', offerRouter);
app.use('/api/ads', adsRouter);

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('SFMS Backend is running successfully.');
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Initialize Cron Jobs
const { initCronJobs } = require('./cron');
initCronJobs();

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
