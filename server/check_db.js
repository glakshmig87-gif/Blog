const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const Blog = mongoose.model('Blog', new mongoose.Schema({}, {strict: false}));
    const blogs = await Blog.find({}).select('slug image').lean();
    console.log('Total blogs:', blogs.length);
    
    for (let b of blogs) {
      if (b.image) {
        console.log(b.slug, Math.round(b.image.length / 1024) + ' KB');
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
