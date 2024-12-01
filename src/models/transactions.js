const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["Revenue", "Expense"], required: true },
  status: { type: String, enum: ["Paid", "Pending"], required: true },
  user_id: { type: String, required: true },
  user_profile: { type: String, required: true },
});

module.exports = mongoose.model("Transaction", transactionSchema);
