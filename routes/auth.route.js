const Joi = require('joi');
const express = require('express');
const router = express.Router();
const JwtService = require('../services/jwt-service');
const User = require('../models/user.model');
const RefreshToken = require('../models/refresh-token.model');
const { REFRESH_KEY } = require('../config');

router.post('/login', async (req, res, next) => {
  // Request validation
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ status: 422, message: error.message });
  }

  // Start database query
  try {
    const user = await User.findOne({ email: req.body.email }).select("-updateAt -__v");
    if (!user) {
      return res.status(401).json({ status: 401, message: 'User is not found' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(req.body.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ status: 401, message: 'Your password is wrong' });
    }

    // Generate token
    const payload = {
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    }
    const access_token = JwtService.sign(payload);
    const refresh_token = JwtService.sign(payload, '30d', REFRESH_KEY)
    // Store refresh token
    await RefreshToken.create({ token: refresh_token });
    res.json({ access_token, refresh_token, data: user, message: 'Sign in success', status: 200 })
    res.end();
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
})

router.post('/register', async (req, res, next) => {
  const formData = req.body;
  const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    number: Joi.number(),
    password: Joi.string().required(),
    password_repeat: Joi.ref('password'),
  })

  const { error } = registerSchema.validate(formData);
  if (error) {
    return res.status(422).json({ status: 422, message: error?.message });
  }

  // Check user exists
  // console.log('Checking user is exists')
  try {
    const isExists = await User.exists({ email: formData.email });
    if (isExists) {
      return res.status(409).json({ status: 409, message: 'User exists! This email is taken' });
    }
  } catch (err) {
    return next(err)
  }

  // Create user
  // console.log('Create user')
  const userPayload = {
    name: formData.name,
    email: formData.email,
    number: formData.number,
    password: formData.password
  }
  try {
    let user = new User(userPayload);
    // const user = await User.create(userPayload);
    user = await user.save();
    const payload = {
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    }
    const access_token = JwtService.sign(payload);
    const refresh_token = JwtService.sign(payload, '1y', REFRESH_KEY);
    // Store refresh token
    await RefreshToken.create({ token: refresh_token });
    res.status(201).json({ status: 201, message: 'User created', access_token, refresh_token, data: user })
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
})

router.post('/refresh', async (req, res, next) => {
  const tokenSchema = Joi.object({
    refresh_token: Joi.string().required()
  })
  const { error } = tokenSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ status: 422, message: error.message });
  }

  try {
    const refreshTokenObj = await RefreshToken.findOne({ token: req.body.refresh_token });
    console.log('refresh token', refreshTokenObj)
    if (!refreshTokenObj) {
      return res.status(401).json({ status: 401, message: 'Invalid, Token is not found' });
    }
    let userId;
    try {
      const { _id } = JwtService.verify(refreshTokenObj.token, REFRESH_KEY);
      userId = _id
    } catch (err) {
      return res.status(401).json({ status: 401, message: 'Invalid refresh token' })
    }

    const user = await User.findOne({ _id: userId }).select("-password -updatedAt -__v")

    if (!user) {
      return res.status(401).json({ status: 401, message: 'No user found!' })
    }
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
    const access_token = JwtService.sign(payload);
    const refresh_token = JwtService.sign(payload, '30d', REFRESH_KEY)
    // Store refresh token
    await RefreshToken.create({ token: refresh_token });
    res.status(201).json({ access_token, refresh_token, user })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: 500, message: err.message });
  }
})

module.exports = router