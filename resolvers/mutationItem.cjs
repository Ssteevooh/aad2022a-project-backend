const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {

  createItem: async (parent, args, { models, user }) => {
    return await models.Item.create({
      name: args.name,
      description: args.description,
      price: args.price,
    });
  },
  deleteItem: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete items');
    }
    await models.Item.findOneAndDelete({ _id: args.family_id })
    //TODO remove also from shopping lists
    return 'Item deleted';
  },
  updateItem: async (parent, args, { models }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update items');
    }
    const updateObject = {}
    if (args.description) updateObject.description = args.description;
    if (args.price) updateObject.price = args.price;
    if (args.name) updateObject.name = args.name;
    return await models.Item.findByIdAndUpdate(
      args.item_id,
      updateObject,
      {
        new: true
      }
    );
  },
};
