const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function addDummyOrders() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sfms_db'
        });

        // Get all merchants
        let [merchants] = await connection.query('SELECT id, shop_name FROM Merchants');
        if (merchants.length === 0) {
            console.log('No merchants found. Creating a dummy merchant...');
            const [merchantResult] = await connection.query(`
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
            
            // Also create some dummy menu items for this merchant so we have items to order
            console.log('Creating dummy menu items for the new merchant...');
            await connection.query(`
                INSERT INTO MenuItems (merchant_id, item_name, category, price, stock, is_available) VALUES 
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?),
                (?, ?, ?, ?, ?, ?)
            `, [
                merchantId, 'Special Fried Rice', 'Main Course', 750.00, 50, 1,
                merchantId, 'Chicken Kottu', 'Main Course', 800.00, 40, 1,
                merchantId, 'Fruit Juice', 'Beverages', 250.00, 100, 1
            ]);
            
            // Re-fetch merchants
            [merchants] = await connection.query('SELECT id, shop_name FROM Merchants');
        }

        // Helper
        function min(a, b) { return a < b ? a : b; }

        for (const merchant of merchants) {
            const merchant_id = merchant.id;
            console.log(`Seeding dummy orders for merchant: ${merchant.shop_name} (ID: ${merchant_id})...`);

            // Get some menu items to use in orders
            let [menuItems] = await connection.query('SELECT id, price FROM MenuItems WHERE merchant_id = ? LIMIT 3', [merchant_id]);
            if (menuItems.length === 0) {
                console.log(`No menu items found for merchant ${merchant.shop_name}. Creating dummy menu items...`);
                await connection.query(`
                    INSERT INTO MenuItems (merchant_id, item_name, category, price, stock, is_available) VALUES 
                    (?, ?, ?, ?, ?, ?),
                    (?, ?, ?, ?, ?, ?),
                    (?, ?, ?, ?, ?, ?)
                `, [
                    merchant_id, 'Special Fried Rice', 'Main Course', 750.00, 50, 1,
                    merchant_id, 'Chicken Kottu', 'Main Course', 800.00, 40, 1,
                    merchant_id, 'Fruit Juice', 'Beverages', 250.00, 100, 1
                ]);
                [menuItems] = await connection.query('SELECT id, price FROM MenuItems WHERE merchant_id = ? LIMIT 3', [merchant_id]);
            }

            const orders = [
                {
                    customer_name: 'John Doe',
                    customer_phone: '0712345678',
                    notes: 'Please add extra sauce',
                    order_type: 'Delivery',
                    status: 'Pending',
                    otp_code: null,
                    items: [
                        { menu_item_id: menuItems[0].id, quantity: 2, price: menuItems[0].price }
                    ]
                },
                {
                    customer_name: 'Jane Smith',
                    customer_phone: '0778765432',
                    notes: 'No onions please',
                    order_type: 'Takeaway',
                    status: 'Accepted',
                    otp_code: '4582',
                    items: [
                        { menu_item_id: menuItems[0].id, quantity: 1, price: menuItems[0].price },
                        { menu_item_id: menuItems[1] ? menuItems[1].id : menuItems[0].id, quantity: 1, price: menuItems[1] ? menuItems[1].price : menuItems[0].price }
                    ]
                },
                {
                    customer_name: 'Ahmed Silva',
                    customer_phone: '0723456789',
                    notes: '',
                    order_type: 'Dine-in',
                    status: 'Completed',
                    otp_code: null,
                    items: [
                        { menu_item_id: menuItems[min(2, menuItems.length - 1)].id, quantity: 3, price: menuItems[min(2, menuItems.length - 1)].price }
                    ]
                },
                {
                    customer_name: 'Kamal Perera',
                    customer_phone: '0756789012',
                    notes: 'Cancel the order',
                    order_type: 'Delivery',
                    status: 'Rejected',
                    otp_code: null,
                    items: [
                        { menu_item_id: menuItems[0].id, quantity: 1, price: menuItems[0].price }
                    ]
                }
            ];

            for (const order of orders) {
                let total_amount = 0;
                for (const item of order.items) {
                    total_amount += item.price * item.quantity;
                }

                const [result] = await connection.query(
                    'INSERT INTO Orders (merchant_id, customer_name, customer_phone, notes, order_type, status, otp_code, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [merchant_id, order.customer_name, order.customer_phone, order.notes, order.order_type, order.status, order.otp_code, total_amount]
                );

                const order_id = result.insertId;

                for (const item of order.items) {
                    await connection.query(
                        'INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                        [order_id, item.menu_item_id, item.quantity, item.price]
                    );
                }
            }
        }

        console.log('Dummy orders inserted successfully for all merchants!');
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Error inserting dummy orders:', error);
        process.exit(1);
    }
}

addDummyOrders();
