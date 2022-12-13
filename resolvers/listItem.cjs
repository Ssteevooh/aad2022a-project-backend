const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  shopping_list: async (listItem, args, { models }) => {
    console.log(listItem);
    return await models.ShoppingList.findById(listItem.shopping_list);
  }
};
