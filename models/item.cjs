const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        /*index: { unique: false }*/
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true,
    }
  },
  {
    timestamps: true
  }
);

const Item = mongoose.model('Item', ItemSchema);
module.exports = Item;
