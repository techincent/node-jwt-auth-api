const mongoose = require('mongoose')

const refreshSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true}
})

module.exports = mongoose.model('RefreshToken', refreshSchema);