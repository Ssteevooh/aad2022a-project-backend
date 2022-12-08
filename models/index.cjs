const User = require('./user.cjs');
const Family = require('./family.cjs');
const Item = require('./item.cjs');
const ListItem = require('./listItem.cjs');
const ShoppingList = require('./shoppingList.cjs');

const models = {
  User,
  Family,
  Item,
  ListItem,
  ShoppingList
};

module.exports = models;
