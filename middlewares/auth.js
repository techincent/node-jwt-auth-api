const JwtService = require("../services/jwt-service");

const authorizationHandler = (req, res, next) => {
  const headerAuthorization = req.headers.authorization;
  if (!headerAuthorization) {
    return res.status(401).json({ status: 401, message: 'Unauthorize user!' });
  }
  // It's for Bearer token header
  const token = headerAuthorization.split(' ')[1];
  try {
    const { _id, email, role } = JwtService.verify(token);
    const user = { _id, email, role }
    req.user = user;
    return next()
  } catch (err) {
    return res.status(401).json({ status: 401, message: 'Invalid token' });
  }
}

module.exports = authorizationHandler;