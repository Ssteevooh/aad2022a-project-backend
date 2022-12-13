require('dotenv').config();

module.exports = {
  family: async (user, args, { models }) => {
    return await models.Family.find({ members: user._id});
  },
  invitations: async (user, args, { models }) => {
    let tempInv = [];
    for (let index = 0; index < user.invitations.length; index++) {
      const invitation = user.invitations[index];
      const foundFamily = await models.Family.findById(invitation);
      tempInv.push(foundFamily);
    }
    return tempInv;
    
  }
};
