
require('dotenv').config();

module.exports = {
  owner_family: async (shoppingList, args, { models }) => {
    return await models.Family.findById(shoppingList.owner_family);
  }
};
  