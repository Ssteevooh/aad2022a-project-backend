const {
    AuthenticationError,
    ForbiddenError,
    ValidationError
  } = require('apollo-server-express');
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  module.exports = {
    owner_family: async (shoppingList, args, { models }) => {
      return await models.Family.findById(shoppingList.owner_family);
    }
  };
  