const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDB() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sfms_db'
        });

        const alterQueries = [
            "ALTER TABLE Merchants ADD COLUMN nic_number VARCHAR(20) AFTER owner_name;",
            "ALTER TABLE Merchants ADD COLUMN registration_id VARCHAR(100) AFTER shop_type;",
            "ALTER TABLE Merchants ADD COLUMN registration_date DATE AFTER registration_id;",
            "ALTER TABLE Merchants ADD COLUMN license_url VARCHAR(255) AFTER registration_date;",
            "ALTER TABLE Merchants ADD COLUMN business_description TEXT AFTER description;",
            "ALTER TABLE Merchants ADD COLUMN is_open BOOLEAN DEFAULT FALSE AFTER delivery_availability;",
            "ALTER TABLE MenuItems ADD COLUMN stock INT DEFAULT 0 AFTER price;"
        ];

        for (const query of alterQueries) {
            try {
                await connection.query(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${query}`);
                } else {
                    console.error(`Error executing ${query}:`, err.message);
                }
            }
        }

        console.log('Database alterations completed!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
}

alterDB();
