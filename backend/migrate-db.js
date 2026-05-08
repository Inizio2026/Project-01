const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sfms_db'
        });

        await connection.query(`
            CREATE TABLE IF NOT EXISTS MerchantContacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL UNIQUE,
                whatsapp_number VARCHAR(50),
                FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
            );
        `);
        console.log('MerchantContacts table created successfully!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
migrateDB();
