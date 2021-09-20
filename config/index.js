const dotenv = require('dotenv');

dotenv.config();
module.exports = {
  APP_PORT,
  DB_URL,
  NODE_ENV,
  SECRET_KEY,
  REFRESH_KEY
} = process.env;
