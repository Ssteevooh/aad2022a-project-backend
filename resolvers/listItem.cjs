const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  item: async (listItem, args, { models }) => {
    return await models.Item.findById(listItem.item);
  },
  shopping_list: async (listItem, args, { models }) => {
    return await models.ShoppingList.findById(listItem.shopping_list);
  }
};
