const express = require("express");
const { connectDb } = require("./config/database");
const transactions = require("./models/transactions");
const transactionData = require("./data/transactions.json")
const transactionRoutes = require('./routes/transactionRoutes');
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use('/api/transactions', transactionRoutes);


connectDb()
  .then(async() => {
    console.log("connection with database successfully established.");
    const count = await transactions.countDocuments();
    console.log(count);
    if (count === 0) {
        console.log('No data found. Loading initial JSON data...');
        await transactions.insertMany(transactionData);
        console.log('Initial data loaded.');
      }
    app.listen("7777", () => {
      console.log("Listening server on port 7777...");
    });
  })
  .catch((err) => {
    console.log("Error in connecting with database" + err);
  });
  