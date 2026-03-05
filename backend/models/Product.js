const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Dinnerware', 'Plates', 'Salad & Side Plates', 'Bowls', 'Deep Plates']
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  restockLevel: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['KIT', 'PCS', 'SET'],
    default: 'KIT'
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);