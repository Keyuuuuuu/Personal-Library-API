// test-user-model.js
const User = require('../src/models/user.model');

async function testUserModel() {
    try {
        console.log('Testing User model...');

        // 测试创建用户
        console.log('Creating a test user...');
        const testUsername = 'testuser_' + Date.now(); // 使用时间戳确保用户名唯一
        const userId = await User.create(
            testUsername,
            `${testUsername}@example.com`,
            'password123',
            'Test User'
        );
        console.log('Created user with ID:', userId);

        // 测试通过ID查找用户
        console.log('Finding user by ID...');
        const user = await User.findById(userId);
        console.log('Found user:', user);

        // 测试通过用户名查找用户
        console.log('Finding user by username...');
        const userByUsername = await User.findByUsername(testUsername);
        console.log('Found user by username:', userByUsername?.username);

        console.log('User model test completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error details:', error.stack);
    } finally {
        process.exit();
    }
}

testUserModel();