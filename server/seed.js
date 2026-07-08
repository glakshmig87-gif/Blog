const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  image: { type: String, required: true },
  content: { type: String, required: true },
  linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

const blogData = [
  {
    title: "Neuro-Architecture: Designing Spaces for Deep Focus",
    category: "Featured",
    readTime: "8 Min Read",
    image: "/luxury_featured_hero.png",
    content: `
      <p>In our hyper-connected, sensory-overloaded world, the concept of 'home' is rapidly evolving. It's no longer just a place to sleep; it's a critical interface for our mental well-being. This is where <strong>Neuro-Architecture</strong> comes in—the science of designing spaces that actively shape our cognitive states.</p>
      <br/>
      <p>Curating a mindful space isn't just about aesthetics; it’s about biological intentionality. It involves stripping away the excess and focusing on architectural geometries that naturally induce a flow state. The ambient aesthetic relies heavily on negative space—allowing the mind to wander without visual friction.</p>
      <br/>
      <h3>The Psychology of Spatial Design</h3>
      <p>Recent studies in cognitive science have shown that ceiling height directly impacts creative thinking, while natural light synchronizes our circadian rhythms, drastically reducing cortisol levels. When we design with these biological markers in mind, we create environments that don't just look good, but actively heal us.</p>
      <br/>
      <h3>Key Elements of a Neuro-Architectural Space:</h3>
      <ul>
        <li><strong>Biophilic Integration:</strong> Don't just place a plant in a corner. We're talking about indoor water features, living moss walls, and materials that mimic the fractals found in nature.</li>
        <li><strong>Circadian Lighting Systems:</strong> Lighting that shifts color temperature autonomously throughout the day, matching the sun's natural progression to optimize sleep cycles.</li>
        <li><strong>Acoustic Isolation:</strong> Using sound-absorbing materials like raw linen, ribbed wood panels, and thick rugs to eliminate the low-frequency hum of urban environments.</li>
      </ul>
      <br/>
      <p>By transforming your environment, you inadvertently transform your neurochemistry. The spaces we inhabit shape the thoughts we produce. A perfectly curated space is the ultimate luxury—a sanctuary for the modern mind.</p>
    `
  },
  {
    title: "Biophilic Luxury: Merging Nature with High-End Design",
    category: "Vertical",
    readTime: "4 Min Read",
    image: "/luxury_decor_hero.png",
    content: `
      <p>A small kitchen doesn't have to be a chaotic one. With the right systems in place, even the tiniest galley kitchen can feel like a professional chef's workspace.</p>
      <br/>
      <p>The secret lies in utilizing vertical space. Look above your cabinets, use magnetic strips for knives on the wall, and install hanging racks for pots and pans.</p>
      <br/>
      <h3>Our Top 3 Hacks:</h3>
      <ol>
        <li><strong>Decant Everything:</strong> Transfer pantry items into clear, uniform jars. It instantly reduces visual clutter.</li>
        <li><strong>Drawer Dividers:</strong> Never underestimate the power of compartmentalization.</li>
        <li><strong>Under-Shelf Baskets:</strong> Maximize the dead space in tall cabinets.</li>
      </ol>
    `
  },
  {
    title: "Quick Read: The 5-Minute Daily Tidy",
    category: "Quick Read",
    readTime: "2 Min Read",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
    content: `
      <p>Consistency is more important than intensity when it comes to keeping a home organized.</p>
      <br/>
      <p>Instead of dedicating an entire weekend to cleaning, implement the '5-Minute Daily Tidy'. Set a timer for 5 minutes every evening before bed. Focus only on high-traffic surfaces: the coffee table, the kitchen island, and the entryway console.</p>
      <br/>
      <p>You'll be amazed at how this tiny habit prevents clutter from accumulating over the week, keeping your space perpetually serene.</p>
    `
  },
  {
    title: "Light & Airy: Designing with White Space",
    category: "Gallery",
    readTime: "3 Min Read",
    image: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1200&auto=format&fit=crop",
    content: `
      <p>A bright, light-filled room doesn't just happen by accident. It's the result of carefully choosing reflective surfaces, sheer window treatments, and a restrained color palette.</p>
      <br/>
      <p>By using white as your primary base, you allow natural light to bounce effortlessly around the room. This not only makes the space feel larger but drastically improves your daily mood.</p>
      <br/>
      <h3>Key Tips for Bright Spaces:</h3>
      <ul>
        <li><strong>Mirrors are Magic:</strong> Place them opposite your largest windows.</li>
        <li><strong>Low-Profile Furniture:</strong> Ensure nothing blocks the path of light from the windows into the room.</li>
        <li><strong>Warm Whites:</strong> Avoid stark, hospital whites. Go for creamy, warm undertones.</li>
      </ul>
    `
  },
  {
    title: "The Ultimate 'That Girl' Aesthetic Room Makeover",
    category: "Horizontal",
    readTime: "6 Min Read",
    image: "/girly_wide.png",
    content: `
      <p>The "That Girl" aesthetic isn't just a TikTok trend—it's a lifestyle focused on wellness, self-care, and surrounding yourself with a beautiful, organized environment. If you want a room that instantly makes you feel put together, this is your ultimate guide.</p>
      <br/>
      <p>The foundation of this aesthetic is a pristine, cozy base. Think soft pastel pinks, creamy whites, and luxurious textures. It’s all about creating a space that feels like a warm hug but looks incredibly chic and photogenic.</p>
      <br/>
      <h3>Must-Have Elements:</h3>
      <ul>
        <li><strong>Fluffy Textures:</strong> A faux fur or high-pile white rug is non-negotiable. It instantly softens the room.</li>
        <li><strong>Rose Gold Accents:</strong> Swap out standard silver or matte black hardware for elegant rose gold touches on your lamps, mirrors, and drawer pulls.</li>
        <li><strong>Fresh Florals:</strong> A vase of fresh pink peonies or dried pampas grass adds life and femininity to the space.</li>
      </ul>
      <br/>
      <p>When your room looks this good, romanticizing your daily routine happens effortlessly.</p>
    `
  },
  {
    title: "Vanity Perfection: Organizing Your Makeup Collection",
    category: "Vanity",
    readTime: "3 Min Read",
    image: "/girly_square.png",
    content: `
      <p>Your vanity is where you start your day; it should make you feel beautiful before you even apply a single product. Cluttered makeup bags are a thing of the past.</p>
      <br/>
      <p>Invest in clear acrylic organizers so you can see your entire collection at a glance. Group products by category (face, eyes, lips) and use small ceramic dishes to hold daily jewelry or hair clips. Add a warm ring light mirror, and your vanity will feel like a professional studio.</p>
    `
  },
  {
    title: "The Ultimate Boys Room: Mixing Function with Style",
    category: "Highlight",
    readTime: "5 Min Read",
    image: "/boys_room_tall.png",
    content: `
      <p>Designing a boys room that grows with them can be challenging. The key is to build a timeless foundation and allow accessories to dictate the current vibe.</p>
      <br/>
      <p>Start with a neutral base—deep navy, forest green, or charcoal grey walls. Invest in high-quality, solid wood furniture that can withstand years of use. Instead of character-themed beds, use framed posters, neon signs, and unique shelving to display their current interests.</p>
      <br/>
      <p>A dedicated, well-lit study zone is crucial. Make sure the desk area is clutter-free and inspiring.</p>
    `
  },
  {
    title: "Monochrome Gaming Setup: The Stealth Aesthetic",
    category: "Gaming",
    readTime: "4 Min Read",
    image: "/gaming_room_square.png",
    content: `
      <p>RGB lighting has dominated the gaming space for years, but there is a massive shift towards the ultra-sleek, monochromatic aesthetic. A pure black and white gaming setup screams sophistication and focus.</p>
      <br/>
      <p>By eliminating colored lighting, you reduce visual fatigue and create a setup that looks like a high-end tech laboratory. It's stealthy, moody, and undeniably cool.</p>
      <br/>
      <h3>How to Achieve the Look:</h3>
      <ul>
        <li><strong>Blackout Tech:</strong> Invest in matte black peripherals—keyboard, mouse, and monitors.</li>
        <li><strong>Pure White LEDs:</strong> Set all ambient lighting to a crisp, cold white (around 6000K).</li>
        <li><strong>Cable Management:</strong> In a monochrome setup, every detail shows. Keep cables invisible.</li>
      </ul>
    `
  },
  {
    title: "The Windowless Bachelor Pad: Mastering Moody Luxury",
    category: "Explore",
    readTime: "7 Min Read",
    image: "/mens_room_wide.png",
    content: `
      <p>Not every space is blessed with floor-to-ceiling windows, and that can actually be an advantage. Designing a windowless room allows you complete control over the lighting and atmosphere, perfect for a moody, masculine bachelor pad.</p>
      <br/>
      <p>Embrace the darkness. Instead of trying to fake natural light, lean into rich, dark walnut wood panels, heavy leather furniture, and dramatic, focused indoor lighting. This creates a den-like, ultra-luxurious atmosphere that feels like a private speakeasy.</p>
      <br/>
      <h3>Key Elements of the Moody Den:</h3>
      <ul>
        <li><strong>Rich Materials:</strong> Dark leather, rough-hewn stone, and dark woods absorb light beautifully.</li>
        <li><strong>Warm Accent Lighting:</strong> Use low-wattage, warm amber lamps to highlight specific areas, like a whiskey decanter or a stack of books.</li>
        <li><strong>Acoustic Depth:</strong> Heavy drapes (even without windows) and thick rugs enhance the cozy, insulated feel of the room.</li>
      </ul>
    `
  }
];

mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  .then(async () => {
    console.log('Connected to MongoDB. Seeding blogs...');
    await Blog.deleteMany({}); // Clear existing to prevent duplicates during testing
    await Blog.insertMany(blogData);
    console.log('Successfully seeded 9 blogs!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
