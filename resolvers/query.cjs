const mongoose = require('mongoose');

module.exports = {
  getFamily: async (parent, args, { models, user }) => {
    return await models.Family.findById(mongoose.Types.ObjectId(args.family_id));
  }, 
  getItems: async (parent, args, { models }) => {
    //Mayby allow search ?
    return await models.Item.find();
  },
  getShoppingListContent: async (parent, args, { models }) => {
    const listItems = await models.ListItem.find({shopping_list: args.shopping_list_id});
    return listItems;
  },
  getShoppingLists: async (parent, args, { models }) => {
    return await models.ShoppingList.findById(args.family_id);
  },
  user: async (parent, args, { models }) => {
    return await models.User.findOne({ username: args.name });
  },
  usersToInvite: async (parent, args, { models }) => {
    return await models.User.find({family: null}).select('id name');
  },
  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
  getMyFamily: async (parent, args, { models, user }) => {
    const currentUser = await models.User.findById(user.id);
    return await models.Family.findById(currentUser.family);
  }, 
};
