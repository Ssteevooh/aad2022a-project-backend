require('dotenv').config();

module.exports = {
  family: async (user, args, { models }) => {
    return await models.Family.find({ members: user._id});
  },
  invitations: async (user, args, { models }) => {
    return await models.Family.find({ id: {$in: [user.invitations]}});
  }
};
