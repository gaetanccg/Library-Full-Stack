const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const Author = require('../models/Author');

const getTopBorrowedBooks = async (limit = 10, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await Loan.aggregate([
    {
      $match: {
        borrowDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$book',
        borrowCount: { $sum: 1 }
      }
    },
    {
      $sort: { borrowCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    {
      $unwind: '$bookDetails'
    },
    {
      $project: {
        _id: 1,
        borrowCount: 1,
        title: '$bookDetails.title',
        isbn: '$bookDetails.isbn',
        authors: '$bookDetails.authors'
      }
    }
  ]);
};

const getStatsByCategory = async () => {
  return await Book.aggregate([
    {
      $match: { isDeleted: false }
    },
    {
      $unwind: '$categories'
    },
    {
      $group: {
        _id: '$categories',
        totalBooks: { $sum: 1 },
        totalCopies: { $sum: '$totalCopies' },
        availableCopies: { $sum: '$availableCopies' },
        borrowedCopies: { $sum: { $subtract: ['$totalCopies', '$availableCopies'] } }
      }
    },
    {
      $addFields: {
        borrowRate: {
          $cond: {
            if: { $eq: ['$totalCopies', 0] },
            then: 0,
            else: {
              $multiply: [
                { $divide: ['$borrowedCopies', '$totalCopies'] },
                100
              ]
            }
          }
        }
      }
    },
    {
      $sort: { totalBooks: -1 }
    }
  ]);
};

const getOverdueUsers = async () => {
  return await Loan.aggregate([
    {
      $match: {
        status: 'en retard'
      }
    },
    {
      $group: {
        _id: '$borrower',
        overdueCount: { $sum: 1 },
        totalFines: { $sum: '$fineAmount' },
        overdueLoans: { $push: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $project: {
        _id: 1,
        overdueCount: 1,
        totalFines: 1,
        userName: {
          $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName']
        },
        email: '$userDetails.email',
        currentFines: '$userDetails.currentFines'
      }
    },
    {
      $sort: { overdueCount: -1 }
    }
  ]);
};

const getLoanEvolution = async (months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return await Loan.aggregate([
    {
      $match: {
        borrowDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$borrowDate' },
          month: { $month: '$borrowDate' }
        },
        totalLoans: { $sum: 1 },
        activeLoans: {
          $sum: {
            $cond: [{ $eq: ['$status', 'en cours'] }, 1, 0]
          }
        },
        returnedLoans: {
          $sum: {
            $cond: [{ $eq: ['$status', 'retourné'] }, 1, 0]
          }
        },
        overdueLoans: {
          $sum: {
            $cond: [{ $eq: ['$status', 'en retard'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalLoans: 1,
        activeLoans: 1,
        returnedLoans: 1,
        overdueLoans: 1
      }
    }
  ]);
};

const getAverageLoanDuration = async () => {
  return await Loan.aggregate([
    {
      $match: {
        status: 'retourné',
        actualReturnDate: { $exists: true }
      }
    },
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    {
      $unwind: '$bookDetails'
    },
    {
      $unwind: '$bookDetails.categories'
    },
    {
      $addFields: {
        loanDuration: {
          $divide: [
            { $subtract: ['$actualReturnDate', '$borrowDate'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $group: {
        _id: '$bookDetails.categories',
        averageDuration: { $avg: '$loanDuration' },
        totalLoans: { $sum: 1 },
        minDuration: { $min: '$loanDuration' },
        maxDuration: { $max: '$loanDuration' }
      }
    },
    {
      $sort: { averageDuration: -1 }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        averageDuration: { $round: ['$averageDuration', 2] },
        totalLoans: 1,
        minDuration: { $round: ['$minDuration', 2] },
        maxDuration: { $round: ['$maxDuration', 2] }
      }
    }
  ]);
};

const getMostPopularAuthors = async (limit = 10) => {
  return await Loan.aggregate([
    {
      $lookup: {
        from: 'books',
        localField: 'book',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    {
      $unwind: '$bookDetails'
    },
    {
      $unwind: '$bookDetails.authors'
    },
    {
      $group: {
        _id: '$bookDetails.authors',
        borrowCount: { $sum: 1 }
      }
    },
    {
      $sort: { borrowCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'authors',
        localField: '_id',
        foreignField: '_id',
        as: 'authorDetails'
      }
    },
    {
      $unwind: '$authorDetails'
    },
    {
      $project: {
        _id: 1,
        borrowCount: 1,
        name: {
          $concat: ['$authorDetails.firstName', ' ', '$authorDetails.lastName']
        },
        nationality: '$authorDetails.nationality'
      }
    }
  ]);
};

const getDashboardStats = async () => {
  const totalBooks = await Book.countDocuments({ isDeleted: false });
  const totalUsers = await User.countDocuments({ status: 'actif' });
  const activeLoans = await Loan.countDocuments({ status: { $in: ['en cours', 'en retard'] } });
  const overdueLoans = await Loan.countDocuments({ status: 'en retard' });
  const totalFines = await User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$currentFines' }
      }
    }
  ]);

  const availableBooks = await Book.aggregate([
    {
      $match: { isDeleted: false }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$availableCopies' }
      }
    }
  ]);

  return {
    totalBooks,
    totalUsers,
    activeLoans,
    overdueLoans,
    totalFines: totalFines[0]?.total || 0,
    availableBooks: availableBooks[0]?.total || 0
  };
};

module.exports = {
  getTopBorrowedBooks,
  getStatsByCategory,
  getOverdueUsers,
  getLoanEvolution,
  getAverageLoanDuration,
  getMostPopularAuthors,
  getDashboardStats
};
