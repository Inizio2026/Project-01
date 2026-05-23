const pool = require('./db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function addMockData() {
    try {
        console.log('Connecting to DB to insert mock orders...');
        
        // Find all merchants
        let [merchants] = await pool.query('SELECT id, shop_name FROM Merchants');
        if (merchants.length === 0) {
            console.log('No registered merchants found! Creating a dummy merchant...');
            const [merchantResult] = await pool.query(`
                INSERT INTO Merchants (
                    owner_name, nic_number, phone, email, password_hash, 
                    shop_name, shop_type, address, area, district, status, is_open
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'John Owner', '123456789V', '0771112222', 'merchant@example.com', 
                '$2b$10$abcdefghijklmnopqrstuv', 'Dummy Stall', 'Restaurant', 
                '123 Main Street', 'Colombo 03', 'Colombo', 'approved', 1
            ]);
            
            const merchantId = merchantResult.insertId;
            console.log(`Dummy merchant created with ID: ${merchantId}`);
            
            // Re-fetch
            [merchants] = await pool.query('SELECT id, shop_name FROM Merchants');
        }
        
        for (const merchant of merchants) {
            const merchant_id = merchant.id;
            console.log(`Inserting mock orders for merchant: ${merchant.shop_name} (ID: ${merchant_id})...`);

            // Create 2 mock menu items to link
            const [items] = await pool.query('SELECT id FROM MenuItems WHERE merchant_id = ? LIMIT 2', [merchant_id]);
            
            let item1_id, item2_id;
            
            if (items.length < 2) {
                // insert fallback menu items
                const [res1] = await pool.query('INSERT INTO MenuItems (merchant_id, item_name, category, price) VALUES (?, ?, ?, ?)', [merchant_id, 'Special Mixed Rice', 'Dinner', 850.00]);
                item1_id = res1.insertId;
                const [res2] = await pool.query('INSERT INTO MenuItems (merchant_id, item_name, category, price) VALUES (?, ?, ?, ?)', [merchant_id, 'Iced Milo', 'Drinks', 400.00]);
                item2_id = res2.insertId;
            } else {
                item1_id = items[0].id;
                item2_id = items[1].id;
            }

            // Insert mock Orders
            const [order1] = await pool.query(`
                INSERT INTO Orders (merchant_id, customer_name, customer_phone, notes, order_type, status, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [merchant_id, 'Amal Perera', '0771234567', 'Extra spicy please', 'Takeaway', 'Pending', 1250.00]);
            
            await pool.query('INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)', [order1.insertId, item1_id, 1, 850.00]);
            await pool.query('INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)', [order1.insertId, item2_id, 1, 400.00]);

            const [order2] = await pool.query(`
                INSERT INTO Orders (merchant_id, customer_name, customer_phone, notes, order_type, status, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [merchant_id, 'Ruwan Silva', '0719876543', 'Table 4', 'Dine-in', 'Pending', 850.00]);
            
            await pool.query('INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)', [order2.insertId, item1_id, 1, 850.00]);

            const [order3] = await pool.query(`
                INSERT INTO Orders (merchant_id, customer_name, customer_phone, notes, order_type, status, total_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [merchant_id, 'Kasun Rajitha', '0761112222', 'Deliver before 1pm', 'Delivery', 'Pending', 1700.00]);
            
            await pool.query('INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)', [order3.insertId, item1_id, 2, 850.00]);
        }

        console.log('✅ Successfully inserted Mock Orders for all registered shops!');
    } catch (err) {
        console.error('Error inserting mock data:', err);
    } finally {
        process.exit(0);
    }
}

addMockData();
