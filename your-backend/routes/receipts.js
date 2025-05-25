import express from 'express';
import Receipt from '../models/Receipt.js';

const router = express.Router();

// Get all receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ date: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
});

// Add a new receipt
router.post('/', async (req, res) => {
  try {
    const { customerName, items } = req.body;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newReceipt = new Receipt({
      customerName,
      items,
      total,
      date: new Date()
    });

    await newReceipt.save();
    res.status(201).json({ message: 'Receipt added', receipt: newReceipt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add receipt', error: err.message });
  }
});

export default router;
