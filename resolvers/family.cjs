const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();
module.exports = {
  owner: async (family, args, { models, user }) => {
    return await models.User.findById(family[0].owner);
  },
  members: async (family, args, { models }) => {
    return await models.User.find({ _id: {$in: family[0].members}});
  }
};
