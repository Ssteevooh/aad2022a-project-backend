const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      require: false,
    },
    name: {
      type: String,
      required: true,
      index: { unique: false }
    },
    email: {
      type: String,
      required: true,
      index: { unique: true }
    },
    password: {
      type: String,
      required: true
    },
    invitations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family'
    }],
    avatar: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', UserSchema);
module.exports = User;
