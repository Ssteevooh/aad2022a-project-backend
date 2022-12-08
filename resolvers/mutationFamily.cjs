const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {

  createFamily: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a family');
    }
    const result = await models.Note.create({
      family_name: args.family_name || null,
      owner: mongoose.Types.ObjectId(user)
    });
    return result;
  },
  deleteFamily: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete family');
    }
    const family = await models.Family.findOne({ _id: args.family_id });
    if (family.owner !== user) {
      throw new AuthenticationError('You must be owner of family to delete it');
    }
    await models.Family.findOneAndDelete({id: args.family_id})
    await models.User.updateMany({family: args.family_id}, {family: null})
    return 'Family deleted';
  },
  inviteMember: async (parent, args, { models }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to invite members');
    }
    const family = await models.Family.findOne({ _id: args.family_id });
    if (family.owner !== user) {
      throw new AuthenticationError('You must be owner of family to invite members');
    }
    await models.User.findByIdAndUpdate(
      args.user_id,
      {
        $push: {
          invitations: mongoose.Types.ObjectId(args.family_id)
        }
      },
      {
        new: true
      }
    );
    return true
  },
  deleteMember: async (parent, args, { models }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete members');
    }
    const family = await models.Family.findOne({ _id: args.family_id });
    if (family.owner !== user) {
      throw new AuthenticationError('You must be owner of family to delete members');
    }
    await models.Family.findByIdAndUpdate(
      args.family_id,
      {
        $pull: {
          members: mongoose.Types.ObjectId(args.user_id)
        }
      },
      {
        new: true
      }
    );
    return true;
  },
  updateFamily: async (parent, args, { models }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update family');
    }
    const family = await models.Family.findOne({ _id: args.family_id });
    if (!family || family.owner !== user) {
      throw new AuthenticationError('You must be owner of family to update family');
    }
    if (!args.family_name) {
      throw new ForbiddenError('You must provide some name for family');
    }
    return await models.Family.findByIdAndUpdate(
      args.family_id,
      {family_name: args.family_name},
      {
        new: true
      }
    );
  }, 
};
