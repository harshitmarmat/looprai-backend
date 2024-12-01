const express = require('express');
const {
  getSummary,
  getMonthlyData,
  getRecentTransactions,
  getTransactionsByDate,
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/summary', getSummary);
router.get('/monthly', getMonthlyData);
router.get('/recent', getRecentTransactions);
router.get('/by-date', getTransactionsByDate);

module.exports = router;
