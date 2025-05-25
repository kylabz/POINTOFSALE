import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username, password });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', admin });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Register (optional)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const exists = await Admin.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });

    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created', admin: newAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

export default router;
