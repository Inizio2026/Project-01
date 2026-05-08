const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedOrders() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sfsm_db'
        });

        // Get the first available merchant
        const [merchants] = await connection.query('SELECT id FROM Merchants LIMIT 1');
        if (merchants.length === 0) {
            console.log('No merchants found. Please register a merchant first.');
            process.exit(1);
        }
        const merchant_id = merchants[0].id;

        // Get available menu items for the merchant to link to the orders
        const [menuItems] = await connection.query('SELECT id, item_name, price FROM MenuItems WHERE merchant_id = ?', [merchant_id]);
        if (menuItems.length === 0) {
            console.log('No menu items found. Please add menu items before generating orders.');
            process.exit(1);
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

        let count = 0;
        console.log(`Inserting ${dummyOrders.length} dummy orders...`);

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
            count++;
        }

        console.log(`Successfully added ${count} realistic dummy orders to your database!`);
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Error generating dummy orders:', error);
        process.exit(1);
    }
}

seedOrders();
