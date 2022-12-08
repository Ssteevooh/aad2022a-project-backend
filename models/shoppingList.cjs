const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Shopping list'
    },
    locked: {
      type: Boolean,
      default: false,
    },
    owner_family: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
    }
  },
  {
    timestamps: true
  }
);

const ShoppingList = mongoose.model('ShoppingList', ShoppingListSchema);

module.exports = ShoppingList;