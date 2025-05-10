// src/controllers/borrowing.controller.js
const Borrowing = require('../models/borrowing.model');
const Book = require('../models/book.model');

exports.getAllBorrowings = async (req, res) => {
    try {
        const userId = req.userId;
        const borrowings = await Borrowing.findAll(userId);

        res.status(200).json({
            success: true,
            borrowings
        });
    } catch (error) {
        console.error("Error in getAllBorrowings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getCurrentBorrowings = async (req, res) => {
    try {
        const userId = req.userId;
        const borrowings = await Borrowing.findCurrentBorrowings(userId);

        res.status(200).json({
            success: true,
            borrowings
        });
    } catch (error) {
        console.error("Error in getCurrentBorrowings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getOverdueBorrowings = async (req, res) => {
    try {
        const userId = req.userId;
        const borrowings = await Borrowing.findOverdueBorrowings(userId);

        res.status(200).json({
            success: true,
            borrowings
        });
    } catch (error) {
        console.error("Error in getOverdueBorrowings:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getBorrowingById = async (req, res) => {
    try {
        const borrowingId = req.params.id;
        const userId = req.userId;

        const borrowing = await Borrowing.findById(borrowingId, userId);
        if (!borrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing record not found"
            });
        }

        res.status(200).json({
            success: true,
            borrowing
        });
    } catch (error) {
        console.error("Error in getBorrowingById:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.createBorrowing = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            bookId,
            borrowerName,
            borrowedDate,
            dueDate,
            notes
        } = req.body;

        // 验证请求
        if (!bookId || !borrowerName || !borrowedDate || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Book ID, borrower name, borrowed date, and due date are required"
            });
        }

        // 检查书籍是否存在
        const book = await Book.findById(bookId, userId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // 检查书籍是否可用
        if (!book.available) {
            return res.status(400).json({
                success: false,
                message: "Book is not available for borrowing"
            });
        }

        // 创建借阅记录
        const borrowingId = await Borrowing.create({
            bookId,
            borrowerName,
            borrowedDate,
            dueDate,
            notes,
            userId
        });

        // 获取创建的借阅记录信息
        const borrowing = await Borrowing.findById(borrowingId, userId);

        res.status(201).json({
            success: true,
            message: "Borrowing record created successfully",
            borrowing
        });
    } catch (error) {
        console.error("Error in createBorrowing:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateBorrowing = async (req, res) => {
    try {
        const borrowingId = req.params.id;
        const userId = req.userId;
        const {
            bookId,
            borrowerName,
            borrowedDate,
            dueDate,
            returnedDate,
            notes
        } = req.body;

        // 验证请求
        if (!bookId || !borrowerName || !borrowedDate || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Book ID, borrower name, borrowed date, and due date are required"
            });
        }

        // 检查借阅记录是否存在
        const existingBorrowing = await Borrowing.findById(borrowingId, userId);
        if (!existingBorrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing record not found"
            });
        }

        // 如果更改了书籍，检查新书籍是否存在
        if (bookId !== existingBorrowing.book_id) {
            const book = await Book.findById(bookId, userId);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }

            // 如果新书籍已经借出且未归还，检查是否可用
            if (!book.available && !returnedDate) {
                return res.status(400).json({
                    success: false,
                    message: "New book is not available for borrowing"
                });
            }
        }

        // 更新借阅记录
        const updated = await Borrowing.update(borrowingId, {
            bookId,
            borrowerName,
            borrowedDate,
            dueDate,
            returnedDate,
            notes
        }, userId);

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to update borrowing record"
            });
        }

        // 获取更新后的借阅记录信息
        const borrowing = await Borrowing.findById(borrowingId, userId);

        res.status(200).json({
            success: true,
            message: "Borrowing record updated successfully",
            borrowing
        });
    } catch (error) {
        console.error("Error in updateBorrowing:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.returnBook = async (req, res) => {
    try {
        const borrowingId = req.params.id;
        const userId = req.userId;

        // 检查借阅记录是否存在
        const existingBorrowing = await Borrowing.findById(borrowingId, userId);
        if (!existingBorrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing record not found"
            });
        }

        // 检查书籍是否已归还
        if (existingBorrowing.returned_date) {
            return res.status(400).json({
                success: false,
                message: "Book has already been returned"
            });
        }

        // 归还书籍
        const returned = await Borrowing.returnBook(borrowingId, userId);
        if (!returned) {
            return res.status(500).json({
                success: false,
                message: "Failed to return book"
            });
        }

        res.status(200).json({
            success: true,
            message: "Book returned successfully"
        });
    } catch (error) {
        console.error("Error in returnBook:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteBorrowing = async (req, res) => {
    try {
        const borrowingId = req.params.id;
        const userId = req.userId;

        // 检查借阅记录是否存在
        const existingBorrowing = await Borrowing.findById(borrowingId, userId);
        if (!existingBorrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing record not found"
            });
        }

        // 删除借阅记录
        const deleted = await Borrowing.delete(borrowingId, userId);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete borrowing record"
            });
        }

        res.status(200).json({
            success: true,
            message: "Borrowing record deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteBorrowing:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};