const mongoose = require('mongoose');
const { getEnv } = require('./env');

async function connectDB() {
  const { mongodbUri } = getEnv();
  await mongoose.connect(mongodbUri);
  console.log('MongoDB connected');
}

module.exports = { connectDB };
