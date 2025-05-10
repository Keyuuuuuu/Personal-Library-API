// src/controllers/book.controller.js
const Book = require('../models/book.model');
const Author = require('../models/author.model');

exports.getAllBooks = async (req, res) => {
    try {
        const userId = req.userId;
        const books = await Book.findAll(userId);

        res.status(200).json({
            success: true,
            books
        });
    } catch (error) {
        console.error("Error in getAllBooks:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.userId;

        const book = await Book.findById(bookId, userId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        res.status(200).json({
            success: true,
            book
        });
    } catch (error) {
        console.error("Error in getBookById:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.createBook = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            title,
            authorId,
            isbn,
            publicationYear,
            publisher,
            genre,
            description,
            pageCount,
            language,
            available
        } = req.body;

        // 验证请求
        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Book title is required"
            });
        }

        // 如果提供了作者ID，检查作者是否存在
        if (authorId) {
            const author = await Author.findById(authorId);
            if (!author) {
                return res.status(404).json({
                    success: false,
                    message: "Author not found"
                });
            }
        }

        // 创建书籍
        const bookId = await Book.create({
            title,
            authorId,
            isbn,
            publicationYear,
            publisher,
            genre,
            description,
            pageCount,
            language,
            available,
            userId
        });

        // 获取创建的书籍信息
        const book = await Book.findById(bookId, userId);

        res.status(201).json({
            success: true,
            message: "Book created successfully",
            book
        });
    } catch (error) {
        console.error("Error in createBook:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.userId;
        const {
            title,
            authorId,
            isbn,
            publicationYear,
            publisher,
            genre,
            description,
            pageCount,
            language,
            available
        } = req.body;

        // 验证请求
        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Book title is required"
            });
        }

        // 检查书籍是否存在
        const existingBook = await Book.findById(bookId, userId);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // 如果提供了作者ID，检查作者是否存在
        if (authorId) {
            const author = await Author.findById(authorId);
            if (!author) {
                return res.status(404).json({
                    success: false,
                    message: "Author not found"
                });
            }
        }

        // 更新书籍信息
        const updated = await Book.update(bookId, {
            title,
            authorId,
            isbn,
            publicationYear,
            publisher,
            genre,
            description,
            pageCount,
            language,
            available
        }, userId);

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to update book"
            });
        }

        // 获取更新后的书籍信息
        const book = await Book.findById(bookId, userId);

        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book
        });
    } catch (error) {
        console.error("Error in updateBook:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.userId;

        // 检查书籍是否存在
        const existingBook = await Book.findById(bookId, userId);
        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // 删除书籍
        const deleted = await Book.delete(bookId, userId);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete book"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteBook:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.searchBooks = async (req, res) => {
    try {
        const { title } = req.query;
        const userId = req.userId;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Search term is required"
            });
        }

        const books = await Book.findByTitle(title, userId);

        res.status(200).json({
            success: true,
            books
        });
    } catch (error) {
        console.error("Error in searchBooks:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getBorrowingHistory = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.userId;

        // 检查书籍是否存在
        const book = await Book.findById(bookId, userId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // 获取借阅历史
        const borrowings = await Book.getBorrowingHistory(bookId, userId);

        res.status(200).json({
            success: true,
            book,
            borrowings
        });
    } catch (error) {
        console.error("Error in getBorrowingHistory:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};