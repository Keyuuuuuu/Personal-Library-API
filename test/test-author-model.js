// test/test-author-model.js
const Author = require('../src/models/author.model');

async function testAuthorModel() {
    try {
        console.log('Testing Author model...');

        // 测试创建作者
        console.log('Creating a test author...');
        const authorId = await Author.create({
            name: 'Test Author ' + Date.now(),
            birthDate: '1990-01-01',
            deathDate: null,
            biography: 'A test author biography'
        });
        console.log('Created author with ID:', authorId);

        // 测试通过ID查找作者
        console.log('Finding author by ID...');
        const author = await Author.findById(authorId);
        console.log('Found author:', author);

        // 测试通过名称查找作者
        console.log('Finding authors by name...');
        const authorsByName = await Author.findByName('Test Author');
        console.log('Found authors by name:', authorsByName.length);

        // 测试获取所有作者
        console.log('Getting all authors...');
        const allAuthors = await Author.findAll();
        console.log('Total authors found:', allAuthors.length);

        console.log('Author model tests completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error details:', error.stack);
    } finally {
        process.exit();
    }
}

testAuthorModel();