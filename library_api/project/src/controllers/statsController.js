const statsService = require('../services/statsService');

exports.getTopBorrowedBooks = async (req, res, next) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    const stats = await statsService.getTopBorrowedBooks(Number(limit), Number(days));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatsByCategory = async (req, res, next) => {
  try {
    const stats = await statsService.getStatsByCategory();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getOverdueUsers = async (req, res, next) => {
  try {
    const stats = await statsService.getOverdueUsers();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoanEvolution = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const stats = await statsService.getLoanEvolution(Number(months));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getAverageLoanDuration = async (req, res, next) => {
  try {
    const stats = await statsService.getAverageLoanDuration();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getMostPopularAuthors = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const stats = await statsService.getMostPopularAuthors(Number(limit));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await statsService.getDashboardStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
