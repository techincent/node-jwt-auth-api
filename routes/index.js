const authRoutes = require('./auth.route');
const User = require('../models/user.model');
const authorizationHandler = require('../middlewares/auth');

module.exports = function (app) {
  app.get('', (req, res, next) => {
    res.json({ 'message': 'Hello! developer' })
  })

  // Auth routes
  app.use('/auth', authRoutes);

  app.get('/users', authorizationHandler, async (req, res, next) => {
    try {
      const users = await User.find();
      return res.json({ status: 200, message: 'Success, User list fetched', data: users })
    } catch (err) {
      return res.status(500).json({ status: 500, message: err.message })
    }
  })
}