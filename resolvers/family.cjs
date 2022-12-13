const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();
module.exports = {
  owner: async (family, args, { models, user }) => {
    if (family[0]) return await models.User.findById(family[0].owner);
    return await models.User.findById(family.owner);
  },
  members: async (family, args, { models }) => {
    if (family[0]) return await models.User.find({ _id: {$in: family[0].members}});
    return await models.User.find({ _id: {$in: family.members}});
  }
};
