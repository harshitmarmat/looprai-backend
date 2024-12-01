const Transaction = require('../models/transactions');

const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const totalRevenue = transactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.category === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalRevenue - totalExpenses;

    res.json({
      "Balance": totalBalance,
      "Revenue":totalRevenue,
      "Expenses":totalExpenses,
      "Savings": totalBalance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMonthlyData = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    if (month) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));

      const transactions = await Transaction.find({
        date: { $gte: startDate, $lt: endDate },
      });

      const revenue = transactions
        .filter((t) => t.category === "Revenue")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter((t) => t.category === "Expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return res.json({
        labels: [`${month}-${year}`], 
        revenue: [revenue], 
        expenses: [expenses],
      });
    }

    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lt: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" }, category: "$category" },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const labels = monthNames; 
    const revenue = Array(12).fill(0); 
    const expenses = Array(12).fill(0); 

    monthlyData.forEach((data) => {
      const index = data._id.month - 1; 
      if (data._id.category === "Revenue") {
        revenue[index] = data.total;
      } else if (data._id.category === "Expense") {
        expenses[index] = data.total;
      }
    });

    res.json({
      year,
      labels, 
      revenue, 
      expenses, 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 3. Recent transactions
const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTransactionsByDate = async (req, res) => {
  try {
    const { startDate, endDate, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { user_id: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await Transaction.countDocuments(filter);

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 }) 
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      transactions,
      totalPages: Math.ceil(totalCount / limit), 
      currentPage: parseInt(page),
      totalTransactions: totalCount, 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  getSummary,
  getMonthlyData,
  getRecentTransactions,
  getTransactionsByDate,
};
