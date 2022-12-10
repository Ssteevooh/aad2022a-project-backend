const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

const gravatar = require('../util/gravatar.cjs');

module.exports = {
  family: async (user, args, { models }) => {
    return await models.Family.find({ members: user._id});
  },
  invitations: async (user, args, { models }) => {
    return await models.Family.find({ _id: {$in: [user.invitations]}});
  }
};
