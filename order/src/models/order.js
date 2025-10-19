const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  user: {   // thêm user để lưu username hoặc userId từ token
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
