const { gql } = require('apollo-server-express');

module.exports = gql`
scalar DateTime

type Family {
  id: ID!
  family_name: String
  owner: User!
  members: [User]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ShoppingList {
  id: ID!
  name: String!
  locked: Boolean!
  owner_family: Family!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User {
  id: ID!
  family: Family
  name: String!
  email: String!
  avatar: String
  invitations: [Family]
}

type ListItem {
  id: ID!
  name: String!
  price: Float
  shopping_list: ShoppingList!
  quantity: Int
  collected: Boolean
  notes: String
  total_price: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
  getFamily(family_id: ID!): Family
  getShoppingListContent(shopping_list_id: ID!): [ListItem]
  getMyShoppingLists: [ShoppingList]!
  user(name: String!): [User]
  usersToInvite: [User!]!
  me: User!
  getMyFamily: Family
}

type Mutation {
  signUp(name: String!, email: String!, password: String!): String!
  signIn(email: String!, password: String!): String!
  updateSelf(name: String, email: String): User!
  leaveFamily: String!
  acceptFamily(family_id: ID!): Family
  createFamily(family_name: String): Family
  deleteFamily(family_id: ID!): String
  inviteMember(family_id: ID, user_id: ID): Boolean
  deleteFamilyMember(user_id: ID!): Boolean
  updateFamily(family_id: ID, family_name: String!): Family
  createShoppingList(name: String): ShoppingList
  toggleShoppingList(shopping_list_id: ID!): ShoppingList
  deleteShoppingList(shopping_list_id: ID, family_id: ID): Boolean

  createListItem(shopping_list_id: ID!, name: String!, price: Float, quantity: Int): ListItem
  updateListItem(shopping_list_id: ID!, name: String!, price: Float, quantity: Int, collected: Boolean, notes: String): ListItem
  deleteListItem(list_item_id: ID!, shopping_list_id: ID!): Boolean
}
`;
