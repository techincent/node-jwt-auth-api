const mongoose = require('mongoose');
const { DB_URL } = require('../config');

exports.connect = () => {
  return mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.info("Database connected...")
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
}