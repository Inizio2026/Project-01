const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initDB() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const dbName = process.env.DB_NAME || 'sfms_db';
        console.log(`Creating database ${dbName} if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.query(`USE \`${dbName}\`;`);

        console.log('Creating tables...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Merchants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                owner_name VARCHAR(255) NOT NULL,
                nic_number VARCHAR(20),
                phone VARCHAR(50) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                shop_name VARCHAR(255) NOT NULL,
                shop_type VARCHAR(100) NOT NULL,
                registration_id VARCHAR(100),
                registration_date DATE,
                license_url VARCHAR(255),
                description TEXT,
                business_description TEXT,
                address TEXT NOT NULL,
                area VARCHAR(100) NOT NULL,
                district VARCHAR(100) NOT NULL,
                lat DECIMAL(10, 8),
                lng DECIMAL(11, 8),
                opening_time TIME,
                closing_time TIME,
                working_days VARCHAR(255),
                tags JSON,
                seating_availability BOOLEAN DEFAULT FALSE,
                takeaway_availability BOOLEAN DEFAULT FALSE,
                delivery_availability BOOLEAN DEFAULT FALSE,
                is_open BOOLEAN DEFAULT FALSE,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                logo_url VARCHAR(255),
                cover_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS MenuItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                price DECIMAL(10, 2) NOT NULL,
                stock INT DEFAULT 0,
                image_url VARCHAR(255),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Offers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_date DATE,
                end_date DATE,
                banner_url VARCHAR(255),
                status ENUM('active', 'expired') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL,
                customer_id INT, -- Nullable for MVP if no customer app yet
                customer_name VARCHAR(255),
                customer_phone VARCHAR(50),
                notes TEXT,
                order_type ENUM('Takeaway', 'Dine-in', 'Delivery') DEFAULT 'Takeaway',
                status ENUM('Pending', 'Accepted', 'Rejected', 'Completed') DEFAULT 'Pending',
                otp_code VARCHAR(10),
                total_amount DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS OrderItems (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                menu_item_id INT NOT NULL,
                quantity INT DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES MenuItems(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS AdRequests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                duration_days INT DEFAULT 7,
                notes TEXT,
                banner_url VARCHAR(255),
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS MerchantContacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                merchant_id INT NOT NULL UNIQUE,
                whatsapp_number VARCHAR(50),
                FOREIGN KEY (merchant_id) REFERENCES Merchants(id) ON DELETE CASCADE
            );
        `);

        console.log('Database initialization completed successfully!');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDB();
