const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema(
  {
    family_name: {
      type: String,
      required: false,
      default: 'Family',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

const Family = mongoose.model('Family', FamilySchema);
module.exports = Family;
