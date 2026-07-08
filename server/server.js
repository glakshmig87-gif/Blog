const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Fix for Node.js SRV resolution issue on certain ISPs
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Increase JSON limit because base64 images can be large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curated_corners';

mongoose.connect(MONGODB_URI, { family: 4 })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String, required: true }, // Base64 string
  scheduledFor: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  image: { type: String, required: true }, // Base64 string
  content: { type: String, required: true },
  linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

// --- API Routes ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { all } = req.query;
    let query = {};
    
    if (all !== 'true') {
      // Only fetch products that are not scheduled for the future
      query = {
        $or: [
          { scheduledFor: null },
          { scheduledFor: { $exists: false } },
          { scheduledFor: { $lte: new Date() } }
        ]
      };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const { title, description, price, link, image, scheduledFor } = req.body;
    
    if (!title || !description || !price || !link || !image) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newProduct = new Product({ 
      title, 
      description, 
      price, 
      link, 
      image,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null
    });
    const savedProduct = await newProduct.save();
    
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- Blog API Routes ---

// Get all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: 1 }).populate('linkedProducts');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Add a new blog
app.post('/api/blogs', async (req, res) => {
  try {
    const { title, category, readTime, image, content, linkedProducts } = req.body;
    
    if (!title || !category || !readTime || !image || !content) {
      return res.status(400).json({ error: 'All fields except linkedProducts are required' });
    }

    const newBlog = new Blog({ title, category, readTime, image, content, linkedProducts: linkedProducts || [] });
    const savedBlog = await newBlog.save();
    
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

// Update a blog
app.put('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, readTime, image, content, linkedProducts } = req.body;
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      id, 
      { title, category, readTime, image, content, linkedProducts: linkedProducts || [] },
      { new: true }
    ).populate('linkedProducts');

    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete a blog
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    
    if (!deletedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
