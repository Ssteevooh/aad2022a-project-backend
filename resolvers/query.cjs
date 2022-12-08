module.exports = {
  getFamily: async (parent, args, { models, user }) => {
    //TODO: Change this. Set as find with user id
    return await models.Family.findById(args.family_id);
  }, 
  getItems: async (parent, args, { models }) => {
    //Mayby allow search ?
    return await models.Item.find();
  },
  getShoppingListContent: async (parent, args, { models }) => {
    return await models.ListItem.find({ id: args.shopping_list_id });
  },
  getShoppingLists: async (parent, args, { models }) => {
    return await models.ShoppingList.find({ id: args.family_id });
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
};
