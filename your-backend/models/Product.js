import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true }, // image path (e.g. /uploads/...)
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
