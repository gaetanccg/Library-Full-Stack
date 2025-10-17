const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createLoan = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    const book = await Book.findById(bookId).session(session);
    if (!book) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Livre non trouvé'
      });
    }

    if (book.availableCopies <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Aucun exemplaire disponible'
      });
    }

    const user = await User.findById(userId).session(session);
    if (!user.canBorrow) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas emprunter de livres (amendes impayées ou compte suspendu)'
      });
    }

    const activeLoans = await Loan.countDocuments({
      borrower: userId,
      status: { $in: ['en cours', 'en retard'] }
    }).session(session);

    if (activeLoans >= 5) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Limite d\'emprunts simultanés atteinte (5 maximum)'
      });
    }

    const LOAN_DURATION_DAYS = 14;
    const expectedReturnDate = new Date();
    expectedReturnDate.setDate(expectedReturnDate.getDate() + LOAN_DURATION_DAYS);

    const loan = await Loan.create([{
      book: bookId,
      borrower: userId,
      expectedReturnDate
    }], { session });

    await book.borrowCopy();

    await user.addToBorrowHistory(loan[0]._id, new Date());

    await session.commitTransaction();

    const populatedLoan = await Loan.findById(loan[0]._id)
      .populate('book')
      .populate('borrower', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Emprunt créé avec succès',
      data: populatedLoan
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.getMyLoans = async (req, res, next) => {
  try {
    const loans = await Loan.findActiveByUser(req.user._id);

    res.json({
      success: true,
      data: {
        loans,
        count: loans.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoanHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const loans = await Loan.findByUser(req.user._id)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Loan.countDocuments({ borrower: req.user._id });

    res.json({
      success: true,
      data: {
        loans,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.returnBook = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const loan = await Loan.findById(req.params.id).session(session);

    if (!loan) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Emprunt non trouvé'
      });
    }

    if (loan.borrower.toString() !== req.user._id.toString() &&
        !['bibliothécaire', 'admin'].includes(req.user.role)) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (loan.status === 'retourné') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Ce livre a déjà été retourné'
      });
    }

    await loan.returnBook();

    const book = await Book.findById(loan.book).session(session);
    await book.returnCopy();

    if (loan.fineAmount > 0) {
      const user = await User.findById(loan.borrower).session(session);
      await user.addFine(loan.fineAmount);
    }

    const user = await User.findById(loan.borrower).session(session);
    const historyEntry = user.borrowHistory.find(
      entry => entry.loan.toString() === loan._id.toString()
    );
    if (historyEntry) {
      historyEntry.returnDate = new Date();
      await user.save({ session });
    }

    await session.commitTransaction();

    const populatedLoan = await Loan.findById(loan._id)
      .populate('book')
      .populate('borrower', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Livre retourné avec succès',
      data: populatedLoan
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

exports.renewLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Emprunt non trouvé'
      });
    }

    if (loan.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (!loan.canRenew) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de renouveler cet emprunt (maximum 2 renouvellements ou emprunt non actif)'
      });
    }

    await loan.renewLoan();

    const populatedLoan = await Loan.findById(loan._id)
      .populate('book')
      .populate('borrower', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Emprunt renouvelé avec succès',
      data: populatedLoan
    });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueLoans = async (req, res, next) => {
  try {
    const overdueLoans = await Loan.findOverdue();

    res.json({
      success: true,
      data: {
        loans: overdueLoans,
        count: overdueLoans.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLoans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId, bookId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.borrower = userId;
    if (bookId) query.book = bookId;

    const loans = await Loan.find(query)
      .populate('book', 'title isbn')
      .populate('borrower', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ borrowDate: -1 });

    const total = await Loan.countDocuments(query);

    res.json({
      success: true,
      data: {
        loans,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};
