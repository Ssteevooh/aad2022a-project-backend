const {
    AuthenticationError,
    ForbiddenError,
    ValidationError
  } = require('apollo-server-express');
  const mongoose = require('mongoose');
  require('dotenv').config();
  
  module.exports = {
    createShoppingList: async (parent, args, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be signed in to create a shopping list');
      }
      const foundUser = await models.User.findOne({ _id: user });
      const result = await models.ShoppingList.create({
        name: args.name || null,
        owner_family: mongoose.Types.ObjectId(foundUser.family)
      });
      return result;
    },
    toggleShoppingList: async (parent, args, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be signed in to toggle shopping list');
      }
      const family = await models.Family.findOne({ _id: args.family_id });
      if (family.owner !== user) {
        throw new AuthenticationError('You must be owner of the family to toggle shopping lists');
      }
      const shoppingList = await models.ShoppingList.findById({id: args.shopping_list_id})
      return await models.ShoppingList.findOneAndUpdate(
        {
          _id: id
        },
        {
          $set: {
            locked: !shoppingList.locked
          }
        },
        {
          new: true
        }
      );
    },
    deleteShoppingList: async (parent, args, { models }) => {
      if (!user) {
        throw new AuthenticationError('You must be signed in to delete shopping lists');
      }
      const family = await models.Family.findOne({ _id: args.family_id });
      if (family.owner !== user) {
        throw new AuthenticationError('You must be owner of the family to toggle shopping lists');
      }
      const shoppingList = await models.ShoppingList.findById({id: args.shopping_list_id});
      if (shoppingList.owner_family !== family._id) {
        throw new AuthenticationError('You must be owner family of this shopping lists');
      }
      await models.ShoppingList.findOneAndDelete({ _id: args.shopping_list_id })
      return true;
    } 
  };
  