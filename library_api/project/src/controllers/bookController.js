const Book = require('../models/Book');
const mongoose = require('mongoose');

exports.getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, author, available } = req.query;

    const query = { isDeleted: false };

    if (category) {
      query.categories = category;
    }

    if (author) {
      query.authors = author;
    }

    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    const books = await Book.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: {
        books,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.searchBooks = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Paramètre de recherche manquant'
      });
    }

    const books = await Book.searchBooks(query)
      .limit(20);

    res.json({
      success: true,
      data: {
        books,
        count: books.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    next(error);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Livre créé avec succès',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

exports.partialUpdateBook = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'title', 'subtitle', 'authors', 'categories', 'totalCopies',
      'availableCopies', 'publicationDate', 'publisher', 'pages',
      'language', 'summary', 'coverImage'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updates,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Livre mis à jour avec succès',
      data: book
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    await book.softDelete();

    res.json({
      success: true,
      message: 'Livre supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.getBooksByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const books = await Book.findByCategory(category)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments({
      categories: category,
      isDeleted: false
    });

    res.json({
      success: true,
      data: {
        books,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};
