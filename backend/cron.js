const cron = require('node-cron');
const pool = require('./db');

function initCronJobs() {
    // Run every hour to delete rejected orders older than 24 hours
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running cron job: Auto-delete rejected orders older than 24 hours');
            const [result] = await pool.query(`
                DELETE FROM Orders 
                WHERE status = 'Rejected' 
                AND created_at < NOW() - INTERVAL 24 HOUR
            `);
            if (result.affectedRows > 0) {
                console.log(`Cron job completed: Deleted ${result.affectedRows} rejected orders.`);
            }
        } catch (error) {
            console.error('Error running auto-delete cron job:', error);
        }
    });

    console.log('Cron jobs initialized successfully.');
}

module.exports = { initCronJobs };
