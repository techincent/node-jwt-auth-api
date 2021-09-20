const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

class JwtService {
  static sign(payload, expiry='6h', secret=SECRET_KEY) {
    return jwt.sign(payload, secret, { expiresIn: expiry })
  }
  static verify(token, secret=SECRET_KEY) {
    return jwt.verify(token, secret)
  }
}

module.exports = JwtService