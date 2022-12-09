const { gql } = require('apollo-server-express');

module.exports = gql`
scalar DateTime

type Family {
  id: ID!
  family_name: String!
  owner: User
  members: [User]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Item {
  id: ID!
  name: String
  description: String!
  price: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ListItem {
  item: Item
  shopping_list: ShoppingList
  quantity: Int!
  collected: Boolean!
  notes: String!
  total_price: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ShoppingList {
  id: ID!
  name: String!
  locked: Boolean!
  owner_family: Family
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User {
  id: ID!
  family: Family!
  name: String!
  email: String!
  avatar: String
  invitations: [Family!]!
}

type Query {
  getFamily: Family
  getItems: [Item!]!
  getShoppingListContent(shopping_list_id: ID!): [ListItem!]!
  getShoppingLists(family_id: ID!): [ShoppingList!]!
  user(username: String!): User
  usersToInvite: [User!]!
  me: User!
}

type Mutation {
  signUp(name: String!, email: String!, password: String!): String!
  signIn(name: String, email: String, password: String!): String!
  leaveFamily: String!
  acceptFamily(family_id: ID): Family
  createFamily(family_name: String): Family
  deleteFamily(family_id: ID!): String
  inviteMember(family_id: ID, user_id: ID): Boolean
  deleteMember(user_id: ID, family_id: ID): Boolean
  updateFamily(family_id: ID, family_name: String!): Family
  createItem(name: String, description: String!, price: Float): Item
  deleteItem(item_id: ID!): String
  updateItem(item_id: ID, name: String!, description: String!, price: Float!): Item
  createShoppingList(name: String!): ShoppingList
  toggleShoppingList(family_id: ID, shopping_list_id: ID): ShoppingList
  deleteShoppingList(shopping_list_id: ID, family_id: ID): Boolean
  createListItem(shopping_list_id: ID, item_id: ID!, quantity: Int!): ListItem
  updateListItem(shopping_list_id: ID, list_item_id: ID, quantity: Int!, collected: Boolean!, notes: String!): ListItem
  deleteListItem(list_item_id: ID, shopping_list_id: ID): Boolean
}
`;
