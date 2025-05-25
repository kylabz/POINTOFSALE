import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const receiptSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  items: [itemSchema],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Receipt', receiptSchema);
