const mongoose = require("mongoose");

const connectDb = async () => {
  const res = await mongoose.connect(
    "mongodb+srv://looprai:dGhZCKGTQJTwmcLR@looprai.kwrik.mongodb.net/looprai"
  );
};

module.exports = { connectDb };
