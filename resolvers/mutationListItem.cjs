const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {

  createListItem: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete list items');
    }
    const shoppingList = await models.ShoppingList.findOne({ _id: args.shopping_list_id });
    if (shoppingList.locked) {
      throw new ForbiddenError('Shopping list is locked');
    }
    return await models.ListItem.create({
      shopping_list: mongoose.Types.ObjectId(args.shopping_list_id),
      notes: args.notes || null,
      quantity: args.quantity || 1,
    });
  },
  deleteListItem: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete items');
    }
    const shoppingList = await models.ShoppingList.findOne({ _id: args.shopping_list_id });
    if (shoppingList.locked) {
      throw new ForbiddenError('Shopping list is locked');
    }
    await models.ListItem.findOneAndDelete({ _id: args.list_item_id })
    return true;
  },
  updateListItem: async (parent, args, { models }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update items');
    }
    const shoppingList = await models.ShoppingList.findOne({ _id: args.shopping_list_id });
    if (shoppingList.locked) {
      throw new ForbiddenError('Shopping list is locked');
    }
    const updateObject = {}
    args.collected ? updateObject.collected = true : updateObject.collected = false;
    if (args.quantity) updateObject.quantity = args.quantity;
    if (args.notes) updateObject.notes = args.notes;
    return await models.Item.findByIdAndUpdate(
      args.list_item_id,
      updateObject,
      {
        new: true
      }
    );
  },
};
