const mongoose = require('mongoose');

module.exports = {
  getFamily: async (parent, args, { models, user }) => {
    return await models.Family.findById(mongoose.Types.ObjectId(args.family_id));
  },
  getShoppingListContent: async (parent, args, { models }) => {
    const listItems = await models.ListItem.find({shopping_list: args.shopping_list_id});
    return listItems;
  },
  getMyShoppingLists: async (parent, args, { models, user }) => {
    const currentUser = await models.User.findById(user.id);
    return await models.ShoppingList.find({owner_family: currentUser.family});
  },
  user: async (parent, args, { models }) => {
  return await models.User.find({ name: {$regex: args.name} }).limit(20);
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
