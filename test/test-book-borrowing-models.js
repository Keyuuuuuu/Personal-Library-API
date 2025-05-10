// test/test-book-borrowing-models.js
const User = require('../src/models/user.model');
const Author = require('../src/models/author.model');
const Book = require('../src/models/book.model');
const Borrowing = require('../src/models/borrowing.model');

async function testBookAndBorrowingModels() {
    try {
        console.log('Testing Book and Borrowing models...');

        // 创建测试用户 (使用已有用户或创建新用户)
        let userId = 1; // 假设ID为1的用户已经存在

        // 检查用户是否存在
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            console.log('Creating a new test user...');
            const testUsername = 'bookuser_' + Date.now();
            userId = await User.create(
                testUsername,
                `${testUsername}@example.com`,
                'password123',
                'Book Test User'
            );
            console.log('Created user with ID:', userId);
        } else {
            console.log('Using existing user with ID:', userId);
        }

        // 创建测试作者
        console.log('Creating a test author...');
        const authorId = await Author.create({
            name: 'Book Test Author ' + Date.now(),
            birthDate: '1980-05-15',
            biography: 'A test author for book testing'
        });
        console.log('Created author with ID:', authorId);

        // 创建测试书籍
        console.log('Creating test book...');
        const bookId = await Book.create({
            title: 'Test Book ' + Date.now(),
            authorId: authorId,
            isbn: '123-456-789',
            publicationYear: 2020,
            publisher: 'Test Publisher',
            genre: 'Fiction',
            description: 'A test book for testing',
            pageCount: 200,
            language: 'English',
            available: true,
            userId: userId
        });
        console.log('Created book with ID:', bookId);

        // 测试通过ID查找书籍
        console.log('Finding book by ID...');
        const book = await Book.findById(bookId, userId);
        console.log('Found book:', book?.title);

        // 创建借阅记录
        console.log('Creating a borrowing record...');
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 14); // 两周后

        const borrowingId = await Borrowing.create({
            bookId: bookId,
            borrowerName: 'Test Borrower',
            borrowedDate: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            notes: 'Test borrowing',
            userId: userId
        });
        console.log('Created borrowing with ID:', borrowingId);

        // 测试通过ID查找借阅记录
        console.log('Finding borrowing by ID...');
        const borrowing = await Borrowing.findById(borrowingId, userId);
        console.log('Found borrowing:', borrowing?.id);

        // 测试归还书籍
        console.log('Returning book...');
        const returned = await Borrowing.returnBook(borrowingId, userId);
        console.log('Book returned success:', returned);

        // 验证书籍现在是可用的
        console.log('Verifying book is now available...');
        const bookAfterReturn = await Book.findById(bookId, userId);
        console.log('Book available after return:', bookAfterReturn?.available);

        console.log('Book and Borrowing model tests completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error details:', error.stack);
    } finally {
        process.exit();
    }
}

testBookAndBorrowingModels();