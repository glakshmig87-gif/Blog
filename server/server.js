const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Fix for Node.js SRV resolution issue on certain ISPs
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const BASE_URL = 'https://curatedcorners.devxyn.com';

// Increase JSON limit because base64 images can be large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/curated_corners';

mongoose.connect(MONGODB_URI, { family: 4 })
  .then(async () => {
    console.log('Connected to MongoDB');
    await migrateExistingBlogsWithSlugs();
  })
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// --- Utility ---
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '').trim() : '';
}

// --- Schemas ---

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

// Blog Schema — extended with SEO fields
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, sparse: true, index: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  image: { type: String, required: true }, // Base64 string or URL
  content: { type: String, required: true },
  metaDescription: { type: String, default: '' },  // SEO-optimized 160-char description
  tags: [{ type: String }],                         // For schema markup and categories
  linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate unique slug before save
blogSchema.pre('save', async function () {
  if (!this.slug) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }
  this.updatedAt = new Date();
});

const Blog = mongoose.model('Blog', blogSchema);

// --- Startup Migration: Add slugs to existing blogs without them ---
async function migrateExistingBlogsWithSlugs() {
  try {
    const blogsWithoutSlugs = await Blog.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }]
    });

    if (blogsWithoutSlugs.length === 0) return;

    for (const blog of blogsWithoutSlugs) {
      let baseSlug = generateSlug(blog.title);
      let slug = baseSlug;
      let count = 1;
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${count++}`;
      }
      await Blog.findByIdAndUpdate(blog._id, { slug });
    }
    console.log(`✅ Migrated ${blogsWithoutSlugs.length} existing blogs with URL slugs`);
  } catch (err) {
    console.error('Blog slug migration error:', err);
  }
}

// ============================================================
// SEO ENDPOINTS — Served at root level, NOT under /api/
// ============================================================

// Dynamic XML Sitemap — auto-updates when new blogs are added
app.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await Blog.find({}, 'slug createdAt updatedAt').sort({ createdAt: -1 });

    const staticPages = [
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/shop`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${BASE_URL}/about`, priority: '0.5', changefreq: 'monthly' },
    ];

    const blogUrls = blogs
      .filter(b => b.slug)
      .map(blog => ({
        loc: `${BASE_URL}/blog/${blog.slug}`,
        lastmod: (blog.updatedAt || blog.createdAt).toISOString().split('T')[0],
        priority: '0.9',
        changefreq: 'monthly'
      }));

    const allUrls = [...staticPages, ...blogUrls];

    const urlEntries = allUrls.map(page => [
      '  <url>',
      `    <loc>${page.loc}</loc>`,
      page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : '',
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      '  </url>'
    ].filter(Boolean).join('\n')).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// JSON Feed v1.1 — Real-time article feed for AI tools & RSS readers
// Auto-updates whenever a new article is published
app.get('/feed.json', async (req, res) => {
  try {
    // Exclude base64 image data from feed (too large, not useful for crawlers)
    const blogs = await Blog.find({}, '-image').sort({ createdAt: -1 });

    const feed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: 'Curated Corners',
      home_page_url: `${BASE_URL}/`,
      feed_url: `${BASE_URL}/feed.json`,
      description: 'Luxury interior design, homedecor, and neuro-architecture editorial blog covering dark aesthetic spaces, gaming setups, and curated product recommendations.',
      icon: `${BASE_URL}/logo.png`,
      favicon: `${BASE_URL}/logo.png`,
      authors: [{ name: 'Curated Corners', url: BASE_URL }],
      language: 'en-US',
      _curatedcorners: {
        total_articles: blogs.length,
        topics: ['Interior Design', 'Homedecor', 'Neuro-Architecture', 'Gaming Setups', 'Luxury Decor']
      },
      items: blogs.map(blog => {
        const summary = blog.metaDescription ||
          stripHtml(blog.content).substring(0, 160);

        return {
          id: `${BASE_URL}/blog/${blog.slug || blog._id}`,
          url: `${BASE_URL}/blog/${blog.slug || blog._id}`,
          title: blog.title,
          content_html: blog.content,
          summary,
          date_published: blog.createdAt.toISOString(),
          date_modified: (blog.updatedAt || blog.createdAt).toISOString(),
          tags: [blog.category, ...(blog.tags || [])].filter(Boolean),
          _curatedcorners: {
            category: blog.category,
            readTime: blog.readTime,
            slug: blog.slug || null
          }
        };
      })
    };

    res.setHeader('Content-Type', 'application/feed+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.json(feed);
  } catch (error) {
    console.error('Feed generation error:', error);
    res.status(500).json({ error: 'Failed to generate feed' });
  }
});

// Dynamic llms.txt — AI crawler discovery file (GPT, Gemini, Perplexity, etc.)
// Auto-updates with every new article published
app.get('/llms.txt', async (req, res) => {
  try {
    const blogs = await Blog.find({}, 'title slug category readTime createdAt').sort({ createdAt: -1 });
    const publishedBlogs = blogs.filter(b => b.slug);

    const articlesSection = publishedBlogs.length > 0
      ? publishedBlogs.map(b =>
          `- [${b.title}](${BASE_URL}/blog/${b.slug}) — ${b.category} • ${b.readTime}`
        ).join('\n')
      : '- No articles published yet.';

    const text = `# Curated Corners — llms.txt

> Curated Corners is a luxury interior design and homedecor editorial blog. We publish in-depth articles on neuro-architecture, dark aesthetic spaces, minimalist gaming setups, feminine room aesthetics, men's room design, and curated product recommendations for modern homes.

## Site Information
- Name: Curated Corners
- URL: ${BASE_URL}
- Language: English
- Type: Interior Design & Homedecor Blog
- Author: Curated Corners Editorial Team

## Machine-Readable Data
- JSON Feed (real-time, updates with every new article): ${BASE_URL}/feed.json
- XML Sitemap (full page index): ${BASE_URL}/sitemap.xml

## Pages
- [Home](${BASE_URL}/) — Bento-grid of all published articles
- [Shop The Aesthetic](${BASE_URL}/shop) — Curated homedecor & furniture products
- [About](${BASE_URL}/about) — Our mission and editorial philosophy

## Published Articles (${publishedBlogs.length} total)
${articlesSection}

## Topics & Keywords
Neuro-Architecture, Biophilic Design, Luxury Homedecor, Dark Aesthetic Rooms, Gaming Setup Design, Girly Room Aesthetic, Boys Room Design, Vanity Organization, Minimalist Interiors, Moody Bachelor Pad, Interior Styling Tips, Spatial Psychology

## Content Policy for AI
- All articles are original editorial content
- Product links are curated affiliate recommendations (Amazon, etc.)
- Content is updated regularly — check ${BASE_URL}/feed.json for latest
- Images may be hosted as data URIs for performance

*Generated dynamically on: ${new Date().toISOString().split('T')[0]}*
`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(text);
  } catch (error) {
    console.error('llms.txt generation error:', error);
    res.status(500).send('Error generating llms.txt');
  }
});

// ============================================================
// PRODUCT API ROUTES
// ============================================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { all } = req.query;
    let query = {};

    if (all !== 'true') {
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
    console.error('Get products error:', error);
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
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================================================
// BLOG API ROUTES
// ============================================================

// Get all blogs
app.get('/api/blogs', async (req, res) => {
  console.log('GET /api/blogs called');
  console.time('Get Blogs');
  try {
    // Exclude content AND image to reduce payload size to practically nothing. The client will lazy-load the image.
    const blogs = await Blog.find().select('-content -image').sort({ createdAt: 1 });
    console.timeEnd('Get Blogs');
    res.json(blogs);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get blog image
app.get('/api/blogs/slug/:slug/image', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug);
    const query = isObjectId ? { _id: req.params.slug } : { slug: req.params.slug };
    const blog = await Blog.findOne(query).select('image');
    if (!blog || !blog.image) return res.status(404).send('Not found');

    if (blog.image.startsWith('http') || blog.image.startsWith('/')) {
      return res.redirect(blog.image);
    }

    const parts = blog.image.split(';');
    if (parts.length < 2) return res.status(400).send('Invalid image format');
    const mimeType = parts[0].split(':')[1];
    const base64Data = parts[1].replace('base64,', '');
    const buffer = Buffer.from(base64Data, 'base64');

    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get a single blog by slug or ID — used for direct URL navigation
app.get('/api/blogs/slug/:slug', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug);
    const query = isObjectId
      ? { $or: [{ slug: req.params.slug }, { _id: req.params.slug }] }
      : { slug: req.params.slug };

    const blog = await Blog.findOne(query).populate('linkedProducts');
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const blogObj = blog.toObject();
    if (blogObj.image && blogObj.image.startsWith('data:')) {
      blogObj.image = `/api/blogs/slug/${blogObj.slug || blogObj._id}/image`;
    }

    res.json(blogObj);
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Add a new blog
app.post('/api/blogs', async (req, res) => {
  try {
    const { title, category, readTime, image, content, linkedProducts, metaDescription, tags } = req.body;

    if (!title || !category || !readTime || !image || !content) {
      return res.status(400).json({ error: 'All fields except linkedProducts are required' });
    }

    const newBlog = new Blog({
      title,
      category,
      readTime,
      image,
      content,
      metaDescription: metaDescription || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      linkedProducts: linkedProducts || []
    });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Add blog error:', error);
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

// Update a blog
app.put('/api/blogs/:id', async (req, res) => {
  try {
    const { title, category, readTime, image, content, linkedProducts, metaDescription, tags } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title, category, readTime, image, content,
        metaDescription: metaDescription || '',
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        linkedProducts: linkedProducts || [],
        updatedAt: new Date()
      },
      { new: true }
    ).populate('linkedProducts');

    if (!updatedBlog) return res.status(404).json({ error: 'Blog not found' });
    res.json(updatedBlog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete a blog
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
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
