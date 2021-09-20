const express = require('express');
const { APP_PORT } = require('./config');
const dbConnect = require('./db/connect');

const app = express();

const routes = require('./routes');


app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.listen(APP_PORT || 8000, () => {
  console.info(`Server listen at http://localhost:${APP_PORT || 8000}`)

  // Database
  dbConnect.connect();
  
  // Routes
  routes(app);
  
})