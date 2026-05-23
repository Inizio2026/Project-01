const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seedOrders() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sfms_db'
        });

        // Get all available merchants
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

        let totalInserted = 0;

        for (const merchant of merchants) {
            const merchant_id = merchant.id;
            console.log(`Generating orders for merchant: ${merchant.shop_name} (ID: ${merchant_id})...`);

            // Get available menu items for the merchant to link to the orders
            let [menuItems] = await connection.query('SELECT id, item_name, price FROM MenuItems WHERE merchant_id = ?', [merchant_id]);
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
                [menuItems] = await connection.query('SELECT id, item_name, price FROM MenuItems WHERE merchant_id = ?', [merchant_id]);
            }

            // Helper to get random menu items
            const getRandomItem = () => menuItems[Math.floor(Math.random() * menuItems.length)];

            // Extended Dummy Orders
            const dummyOrders = [
                {
                    customer_name: 'Alex Johnson',
                    customer_phone: '0714455667',
                    notes: 'Please make it extra spicy',
                    order_type: 'Delivery',
                    status: 'Pending',
                    otp_code: null,
                    items: [{ ...getRandomItem(), quantity: 2 }, { ...getRandomItem(), quantity: 1 }]
                },
                {
                    customer_name: 'Sarah Williams',
                    customer_phone: '0778899001',
                    notes: '',
                    order_type: 'Takeaway',
                    status: 'Pending',
                    otp_code: null,
                    items: [{ ...getRandomItem(), quantity: 1 }]
                },
                {
                    customer_name: 'Michael Brown',
                    customer_phone: '0721122334',
                    notes: 'No mayonnaise',
                    order_type: 'Dine-in',
                    status: 'Accepted',
                    otp_code: '8492',
                    items: [{ ...getRandomItem(), quantity: 3 }, { ...getRandomItem(), quantity: 2 }]
                },
                {
                    customer_name: 'Emma Davis',
                    customer_phone: '0755566778',
                    notes: 'Call when arriving',
                    order_type: 'Delivery',
                    status: 'Accepted',
                    otp_code: '1103',
                    items: [{ ...getRandomItem(), quantity: 1 }, { ...getRandomItem(), quantity: 1 }]
                },
                {
                    customer_name: 'David Wilson',
                    customer_phone: '0789988776',
                    notes: '',
                    order_type: 'Takeaway',
                    status: 'Completed',
                    otp_code: null,
                    items: [{ ...getRandomItem(), quantity: 4 }]
                },
                {
                    customer_name: 'Chloe Taylor',
                    customer_phone: '0701122334',
                    notes: 'Allergic to peanuts',
                    order_type: 'Dine-in',
                    status: 'Completed',
                    otp_code: null,
                    items: [{ ...getRandomItem(), quantity: 2 }, { ...getRandomItem(), quantity: 1 }]
                },
                {
                    customer_name: 'Daniel Anderson',
                    customer_phone: '0712233445',
                    notes: 'Customer canceled',
                    order_type: 'Delivery',
                    status: 'Rejected',
                    otp_code: null,
                    items: [{ ...getRandomItem(), quantity: 1 }]
                }
            ];

            console.log(`Inserting ${dummyOrders.length} dummy orders for ${merchant.shop_name}...`);

            for (const order of dummyOrders) {
                let total_amount = 0;
                // Calculate total
                for (const item of order.items) {
                    total_amount += parseFloat(item.price) * item.quantity;
                }

                // Insert into Orders table
                const [orderResult] = await connection.query(
                    'INSERT INTO Orders (merchant_id, customer_name, customer_phone, notes, order_type, status, otp_code, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [merchant_id, order.customer_name, order.customer_phone, order.notes, order.order_type, order.status, order.otp_code, total_amount]
                );

                const order_id = orderResult.insertId;

                // Insert into OrderItems table
                for (const item of order.items) {
                    await connection.query(
                        'INSERT INTO OrderItems (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                        [order_id, item.id, item.quantity, item.price]
                    );
                }
                totalInserted++;
            }
        }

        console.log(`Successfully added ${totalInserted} realistic dummy orders across all database merchants!`);
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Error generating dummy orders:', error);
        process.exit(1);
    }
}

seedOrders();
