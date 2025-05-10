// src/controllers/author.controller.js
const Author = require('../models/author.model');

exports.getAllAuthors = async (req, res) => {
    try {
        const authors = await Author.findAll();

        res.status(200).json({
            success: true,
            authors
        });
    } catch (error) {
        console.error("Error in getAllAuthors:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getAuthorById = async (req, res) => {
    try {
        const authorId = req.params.id;

        const author = await Author.findById(authorId);
        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }

        // 获取作者的所有书籍
        const books = await Author.getBooks(authorId);

        res.status(200).json({
            success: true,
            author,
            books
        });
    } catch (error) {
        console.error("Error in getAuthorById:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.createAuthor = async (req, res) => {
    try {
        const { name, birthDate, deathDate, biography } = req.body;

        // 验证请求
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Author name is required"
            });
        }

        // 创建作者
        const authorId = await Author.create({
            name,
            birthDate,
            deathDate,
            biography
        });

        // 获取创建的作者信息
        const author = await Author.findById(authorId);

        res.status(201).json({
            success: true,
            message: "Author created successfully",
            author
        });
    } catch (error) {
        console.error("Error in createAuthor:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateAuthor = async (req, res) => {
    try {
        const authorId = req.params.id;
        const { name, birthDate, deathDate, biography } = req.body;

        // 验证请求
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Author name is required"
            });
        }

        // 检查作者是否存在
        const existingAuthor = await Author.findById(authorId);
        if (!existingAuthor) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }

        // 更新作者信息
        const updated = await Author.update(authorId, {
            name,
            birthDate,
            deathDate,
            biography
        });

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Failed to update author"
            });
        }

        // 获取更新后的作者信息
        const author = await Author.findById(authorId);

        res.status(200).json({
            success: true,
            message: "Author updated successfully",
            author
        });
    } catch (error) {
        console.error("Error in updateAuthor:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteAuthor = async (req, res) => {
    try {
        const authorId = req.params.id;

        // 检查作者是否存在
        const existingAuthor = await Author.findById(authorId);
        if (!existingAuthor) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }

        // 删除作者
        const deleted = await Author.delete(authorId);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete author"
            });
        }

        res.status(200).json({
            success: true,
            message: "Author deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteAuthor:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.searchAuthors = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Search term is required"
            });
        }

        const authors = await Author.findByName(name);

        res.status(200).json({
            success: true,
            authors
        });
    } catch (error) {
        console.error("Error in searchAuthors:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};