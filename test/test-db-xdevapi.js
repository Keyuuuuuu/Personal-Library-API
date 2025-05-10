// test-db-xdevapi.js
const { testConnection, initDatabase } = require('../src/config/db.config');

async function runTest() {
    try {
        console.log('Testing database connection...');
        const connected = await testConnection();
        console.log('Connection successful?', connected ? 'Yes' : 'No');

        if (connected) {
            console.log('Initializing database tables...');
            await initDatabase();
        }
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // 由于使用连接池，需要手动退出进程
        process.exit();
    }
}

runTest();