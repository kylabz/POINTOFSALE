
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';

import receiptsRouter from './routes/receipts.js';
import productsRouter from './routes/products.js';
import adminRouter from './routes/admin.js';

import Product from './models/Product.js';
import Receipt from './models/Receipt.js';
// If you have a User model, import it here
// import User from './models/User.js';

dotenv.config();

const PORT = process.env.PORT || 5001;
// Use your actual LAN IP here for clients on same network to access
const SERVER_IP = '192.168.162.56';

mongoose.set('strictQuery', false);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Enable CORS for REST endpoints
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected');
  generateReceiptFromProducts();
})
.catch(error => console.error('❌ MongoDB connection failed:', error));

mongoose.connection.on('error', err => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('🔓 Mongoose connection open');
});

// Serve static uploaded files
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Image upload route, returns full URL with IP & port
app.post('/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `http://${SERVER_IP}:${PORT}/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

// Product creation route with image upload and URL storage
app.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, price, quantity, category } = req.body;
  const image = req.file ? `http://${SERVER_IP}:${PORT}/uploads/${req.file.filename}` : null;

  if (!name || !price || !quantity || !category || !image) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = new Product({ name, price, quantity, category, image });
    await newProduct.save();
    io.emit('product-added', newProduct); // Notify all clients
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
});

// Receipt creation route with image upload and URL storage
app.post('/api/receipts', upload.single('image'), async (req, res) => {
  const { customerName, items, total } = req.body;
  const image = req.file ? `http://${SERVER_IP}:${PORT}/uploads/${req.file.filename}` : null;

  if (!customerName || !items || !total) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newReceipt = new Receipt({
      customerName,
      items,
      total,
      date: new Date(),
      image, // Save image URL if provided
    });
    await newReceipt.save();
    io.emit('receipt-added', newReceipt); // Notify all clients
    res.status(201).json({ message: 'Receipt added successfully', receipt: newReceipt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add receipt', error: err.message });
  }
});

// Register route with image upload and URL storage (for admin/user)
app.post('/api/register', upload.single('image'), async (req, res) => {
  const { username, email, password } = req.body;
  const image = req.file ? `http://${SERVER_IP}:${PORT}/uploads/${req.file.filename}` : null;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Add your user creation logic here (User model etc)
    // Example: const newUser = new User({ username, email, password, image });
    // await newUser.save();
    res.status(201).json({ message: 'User registered successfully', image });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user', error: err.message });
  }
});

// Attach routers for other API routes
app.use('/api/products', productsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/admin', adminRouter);

// WebSocket events for chat and others
io.on('connection', socket => {
  console.log(`📡 WebSocket client connected: ${socket.id}`);

  socket.emit('connected', { message: 'You are connected!', socketId: socket.id });

  socket.on('chat message', (msg) => {
    console.log(`💬 Message from ${socket.id}: ${msg}`);
    // Broadcast chat message to all clients including sender
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`❌ WebSocket client disconnected: ${socket.id}`);
  });
});

// REST endpoint for chat messages (optional, can be used for logging or processing)
app.post('/api/message', (req, res) => {
  const { text } = req.body;

  if (!text) {
    console.log('⚠️ Received empty message');
    return res.status(400).json({ error: 'Message text is required' });
  }

  console.log(`📨 REST message received: ${text}`);
  // Optionally broadcast via socket.io if needed:
  // io.emit('chat message', text);

  return res.status(200).json({ message: 'Message received successfully' });
});

// Utility to create a sample receipt on startup from first two products, including image URLs
const generateReceiptFromProducts = async () => {
  try {
    const products = await Product.find().limit(2);
    if (!products.length) return;

    const items = products.map(p => ({
      product: p.name,
      quantity: 1,
      price: p.price,
      image: p.image, // Forward product image URL to receipt items
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const existing = await Receipt.findOne({ customerName: 'Auto-Generated Receipt', total });
    if (!existing) {
      await Receipt.create({
        customerName: 'Auto-Generated Receipt',
        items,
        total,
        date: new Date(),
        image: items[0]?.image || null, // Optionally set receipt image as first product's image
      });
      console.log('🧾 Sample receipt generated.');
    } else {
      console.log('ℹ️ Sample receipt already exists.');
    }
  } catch (err) {
    console.error('❌ Error generating receipt:', err);
  }
};

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://${SERVER_IP}:${PORT}`);
});
