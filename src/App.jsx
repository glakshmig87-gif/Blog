import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './article.css';

const BASE_URL = 'https://curatedcorners.devxyn.com';

// --- Utility helpers ---
function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '').trim() : '';
}

function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

function getSafeImageUrl(image) {
  return isBase64(image) ? `${BASE_URL}/logo.png` : image;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ============================================================
// ARTICLE VIEW
// ============================================================
function ArticleView({ blogs }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  // While blogs are loading from the API, show a minimal loader
  if (blogs.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading article...</div>
      </div>
    );
  }

  const post = blogs.find(b => b.slug === slug);

  if (!post) {
    navigate('/', { replace: true });
    return null;
  }

  const safeImage = getSafeImageUrl(post.image);
  const metaDesc = post.metaDescription ||
    stripHtml(post.content).substring(0, 155) + '...';
  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
  const publishedDate = post.createdAt ? new Date(post.createdAt).toISOString() : '';
  const modifiedDate = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedDate;

  // JSON-LD: Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: metaDesc,
    image: safeImage,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Organization',
      name: 'Curated Corners',
      url: BASE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Curated Corners',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
        width: 200,
        height: 60
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    articleSection: post.category,
    keywords: [post.category, ...(post.tags || []), 'interior design', 'homedecor'].join(', ')
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: post.category, item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl }
    ]
  };

  const handleViewImage = () => {
    window.open(post.image, '_blank');
  };

  return (
    <div className="article-view">
      <Helmet>
        <title>{post.title} | Curated Corners</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content={`${post.category}, homedecor, interior design, luxury decor${post.tags ? ', ' + post.tags.join(', ') : ''}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${post.title} | Curated Corners`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={safeImage} />
        <meta property="og:site_name" content="Curated Corners" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={modifiedDate} />
        <meta property="article:section" content={post.category} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Curated Corners`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={safeImage} />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="navbar-wrapper">
        <nav className="navbar-pill">
          <Link to="/" className="back-btn" style={{ textDecoration: 'none' }}>
            &larr; Back to Grid
          </Link>
          <span className="navbar-divider">|</span>
          <button className="download-btn" onClick={handleViewImage}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            View Full Image
          </button>
        </nav>
      </div>

      <article className="article-container" itemScope itemType="https://schema.org/Article">
        <div className="article-hero" style={{ backgroundImage: `url(${post.image})` }}>
          <div className="article-hero-overlay"></div>
          <div className="article-hero-content">
            {/* Breadcrumb nav for SEO and UX */}
            <nav aria-label="breadcrumb" style={{ marginBottom: '12px' }}>
              <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link></li>
                <li style={{ color: '#fff' }}>/</li>
                <li style={{ color: '#fff' }}>{post.category}</li>
              </ol>
            </nav>
            <span className="article-category">{post.category}</span>
            <h1 itemProp="headline">{post.title}</h1>
            {/* Article meta: date + read time */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', opacity: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
              {publishedDate && (
                <time dateTime={publishedDate} itemProp="datePublished" style={{ color: '#fff' }}>
                  {formatDate(post.createdAt)}
                </time>
              )}
              <span style={{ color: '#fff' }}>•</span>
              <span style={{ color: '#fff' }}>{post.readTime}</span>
              <span style={{ color: '#fff' }}>•</span>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization" style={{ color: '#fff' }}>
                <span itemProp="name">Curated Corners</span>
              </span>
            </div>
          </div>
        </div>

        <div className="article-body" itemProp="articleBody">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>
    </div>
  );
}

// ============================================================
// HOME VIEW — Bento Grid
// ============================================================
function HomeView({ blogs, visibleBlogsCount, setVisibleBlogsCount }) {
  // JSON-LD: WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Curated Corners',
    url: `${BASE_URL}/`,
    description: 'Luxury interior design, homedecor, and neuro-architecture blog.',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // JSON-LD: ItemList of blog articles
  const articleListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Curated Corners Articles',
    url: `${BASE_URL}/`,
    numberOfItems: blogs.length,
    itemListElement: blogs.slice(0, visibleBlogsCount).map((blog, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/blog/${blog.slug || blog._id}`,
      name: blog.title
    }))
  };

  return (
    <>
      <Helmet>
        <title>Curated Corners | Luxury Interior Design &amp; Homedecor</title>
        <meta name="description" content="Discover luxury interior design, modern homedecor, and neuro-architecture. Explore curated aesthetic spaces and dark luxury interiors." />
        <meta name="keywords" content="homedecor, interior design, modern furniture, luxury living spaces, neuro-architecture, curated spaces, aesthetic decor" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${BASE_URL}/`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/`} />
        <meta property="og:title" content="Curated Corners | Luxury Interior Design &amp; Homedecor" />
        <meta property="og:description" content="Discover luxury interior design, modern homedecor, and neuro-architecture. Explore curated aesthetic spaces." />
        <meta property="og:image" content={`${BASE_URL}/luxury_featured_hero.png`} />
        <meta property="og:site_name" content="Curated Corners" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Curated Corners | Luxury Interior Design &amp; Homedecor" />
        <meta name="twitter:description" content="Discover luxury interior design, modern homedecor, and neuro-architecture." />
        <meta name="twitter:image" content={`${BASE_URL}/luxury_featured_hero.png`} />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleListSchema)}</script>
      </Helmet>

      <div className="navbar-wrapper">
        <nav className="navbar-pill">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="Curated Corners Logo" className="logo" />
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Discover</Link></li>
            <li><Link to="/shop">Buy</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>
      </div>

      <main className="bento-section">
        <div className="container">
          <header className="bento-header">
            <h1>Curted Corners.</h1>
            <p>A new spatial way to explore curated spaces and design philosophy.</p>
          </header>

          <div className="bento-grid">
            {blogs.slice(0, visibleBlogsCount).map((blog, index) => {
              const gridClasses = [
                'box-large', 'box-tall', 'box-small', 'box-small',
                'box-wide', 'box-small', 'box-tall', 'box-small', 'box-wide'
              ];
              const boxClass = gridClasses[index % gridClasses.length];
              const articleUrl = `/blog/${blog.slug || blog._id}`;

              return (
                <article
                  key={blog._id}
                  className={`bento-box ${boxClass}`}
                  style={{ animationDelay: `${0.1 * ((index % 9) + 1)}s` }}
                >
                  {/* Proper <a> link for SEO — crawlers follow this */}
                  <Link
                    to={articleUrl}
                    aria-label={`Read article: ${blog.title}`}
                    style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      className="box-image-bg"
                      style={{ backgroundImage: `url(${blog.image})` }}
                      role="img"
                      aria-label={`Cover image for ${blog.title}`}
                    ></div>
                    <div className="box-gradient-overlay" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.1) 60%, rgba(5,5,5,0) 100%)' }}></div>
                    <div className="box-category">{blog.category} &bull; {blog.readTime}</div>
                    <div className="box-content">
                      <h2 className="box-title">{blog.title}</h2>
                      {(boxClass === 'box-large' || boxClass === 'box-wide') && blog.content && (
                        <p className="box-excerpt">
                          {stripHtml(blog.content).substring(0, 80)}...
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {blogs.length > visibleBlogsCount && (
            <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '20px' }}>
              <button
                onClick={() => setVisibleBlogsCount(prev => prev + 9)}
                style={{ padding: '16px 40px', background: 'transparent', color: '#fff', border: '1px solid var(--accent-glow)', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.3s' }}
                onMouseOver={(e) => { e.target.style.background = 'var(--accent-glow)'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
              >
                Load More Discoveries
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ============================================================
// SHOP VIEW
// ============================================================
function ShopView({ products, visibleProductsCount, setVisibleProductsCount }) {
  const visibleProducts = products.filter(
    p => !p.scheduledFor || new Date(p.scheduledFor) <= new Date()
  );

  // JSON-LD: ItemList for products
  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Curated Corners — Shop The Aesthetic',
    url: `${BASE_URL}/shop`,
    numberOfItems: visibleProducts.length,
    itemListElement: visibleProducts.slice(0, visibleProductsCount).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.title,
        description: p.description,
        offers: {
          '@type': 'Offer',
          price: p.price.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: p.link
        }
      }
    }))
  };

  return (
    <div className="buy-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards' }}>
      <Helmet>
        <title>Shop The Aesthetic | Curated Corners Homedecor</title>
        <meta name="description" content="Shop exclusive homedecor, luxury furniture, and aesthetic lighting hand-selected by our design team. Elevate your space with Curated Corners." />
        <meta name="keywords" content="buy homedecor, luxury furniture shop, aesthetic decor, interior design products, modern lighting" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${BASE_URL}/shop`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shop The Aesthetic | Curated Corners Homedecor" />
        <meta property="og:description" content="Shop exclusive homedecor, luxury furniture, and aesthetic lighting hand-selected by our design team." />
        <meta property="og:url" content={`${BASE_URL}/shop`} />
        <meta property="og:image" content={`${BASE_URL}/luxury_featured_hero.png`} />
        <script type="application/ld+json">{JSON.stringify(productListSchema)}</script>
      </Helmet>

      <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
        <Link to="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </Link>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '16px' }}>Shop The Aesthetic</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
          Curated furniture, lighting, and decor to elevate your space. Every piece is hand-selected by our architects.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', textAlign: 'left' }}>
          {visibleProducts.slice(0, visibleProductsCount).map((product) => (
            <article key={product._id || product.id} itemScope itemType="https://schema.org/Product" style={{ background: 'var(--bento-bg)', borderRadius: '24px', border: '1px solid var(--bento-border)', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease' }}>
              <div
                style={{ height: '250px', backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                role="img"
                aria-label={`Image of ${product.title}`}
              ></div>
              <div style={{ padding: '24px' }}>
                <h3 itemProp="name" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{product.title}</h3>
                <p itemProp="description" style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5', minHeight: '40px', wordWrap: 'break-word' }}>{product.description}</p>
                <div itemProp="offers" itemScope itemType="https://schema.org/Offer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <meta itemProp="priceCurrency" content="USD" />
                  <span itemProp="price" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{product.price}</span>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    itemProp="url"
                    style={{ padding: '12px 24px', background: '#fff', color: '#000', borderRadius: '100px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}
                  >
                    Buy Now
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleProducts.length > visibleProductsCount && (
          <button
            onClick={() => setVisibleProductsCount(prev => prev + 6)}
            style={{ padding: '16px 32px', background: 'var(--accent-glow)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '60px' }}
          >
            Load More Products
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ABOUT VIEW
// ============================================================
function AboutView() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Curated Corners',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'A luxury interior design and homedecor editorial blog focused on neuro-architecture, dark aesthetics, and intentional spatial design.',
    sameAs: []
  };

  return (
    <div className="about-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards' }}>
      <Helmet>
        <title>About Us | Curated Corners</title>
        <meta name="description" content="Learn about Curated Corners — our mission in neuro-architecture and our passion for dark luxury homedecor and intentional spatial design." />
        <meta name="keywords" content="about curated corners, homedecor mission, neuro-architecture, luxury interior design blog" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${BASE_URL}/about`} />
        <meta property="og:title" content="About Us | Curated Corners" />
        <meta property="og:description" content="Our mission in neuro-architecture and passion for dark luxury homedecor." />
        <meta property="og:url" content={`${BASE_URL}/about`} />
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      </Helmet>

      <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
        <Link to="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '24px' }}>About Curated Corners</h1>
        <div itemScope itemType="https://schema.org/Organization" style={{ color: '#D1D1D6', fontSize: '1.25rem', lineHeight: '1.8', textAlign: 'left', background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)' }}>
          <p style={{ marginBottom: '24px' }}>
            At <strong itemProp="name">Curated Corners</strong>, we believe that the spaces we inhabit shape the way we think, feel, and create. Our mission is to document and design the world's most inspiring interiors, merging dark luxury aesthetics with high-functional modernism.
          </p>
          <p style={{ marginBottom: '24px' }}>
            What started as an architectural research project has evolved into a premium design hub. We explore everything from neuro-architecture and biophilic design to monochrome gaming sanctuaries and windowless luxury dens.
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--accent-glow)' }}>
            "Your environment is your ultimate operating system. Design it with intention."
          </p>
          <p style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '1rem', color: '#888' }}>
            Developed by <strong>Nouraiz Ashraf</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN VIEW
// ============================================================
function AdminView({ blogs, setBlogs, products, setProducts }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);

  const [newBlog, setNewBlog] = useState({
    title: '',
    category: '',
    readTime: '',
    image: '',
    content: '',
    metaDescription: '',
    tags: '',
    linkedProducts: []
  });

  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    link: '',
    image: '',
    scheduledFor: ''
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '16px'
  };

  if (!isAdminAuthenticated) {
    const handleLogin = (e) => {
      e.preventDefault();
      const validUsername = import.meta.env.VITE_ADMIN_USERNAME || 'NRZ';
      const validPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'wtf@123';
      if (loginUsername === validUsername && loginPassword === validPassword) {
        setIsAdminAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
    };

    return (
      <div className="admin-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Helmet>
          <title>Admin Login | Curated Corners</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
          <Link to="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </Link>
        </div>
        <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Login</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter credentials to access the panel.</p>
          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
            <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} style={inputStyle} required autoComplete="username" />
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={inputStyle} required autoComplete="current-password" />
            <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--accent-glow)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '16px' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  // --- Shared image compression ---
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_WIDTH = 1200;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Blog handlers ---
  const handleBlogImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (compressed) => setNewBlog(prev => ({ ...prev, image: compressed })));
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.category || !newBlog.readTime || !newBlog.image || !newBlog.content) {
      alert('Please fill all required blog fields.');
      return;
    }
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBlog,
          tags: newBlog.tags ? newBlog.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      });
      if (response.ok) {
        const savedBlog = await response.json();
        setBlogs(prev => [...prev, savedBlog]);
        setNewBlog({ title: '', category: '', readTime: '', image: '', content: '', metaDescription: '', tags: '', linkedProducts: [] });
        alert('Blog saved successfully!');
      } else {
        alert('Failed to save blog.');
      }
    } catch (error) {
      console.error('Add blog error:', error);
      alert('Error connecting to database');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
        if (response.ok) {
          setBlogs(prev => prev.filter(b => b._id !== blogId));
        } else {
          alert('Failed to delete blog.');
        }
      } catch (err) {
        console.error('Delete blog error:', err);
        alert('Error connecting to database');
      }
    }
  };

  // --- Product handlers ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (compressed) => setNewProduct(prev => ({ ...prev, image: compressed })));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.image || !newProduct.link) {
      alert('Please fill all required fields (Image, Title, Link).');
      return;
    }
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (response.ok) {
        const savedProduct = await response.json();
        setProducts(prev => [savedProduct, ...prev]);
        setNewProduct({ title: '', description: '', price: '', link: '', image: '', scheduledFor: '' });
        alert('Product saved to MongoDB successfully!');
      } else {
        alert('Failed to save product.');
      }
    } catch (error) {
      console.error('Add product error:', error);
      alert('Error connecting to database');
    }
  };

  const handleDeleteProduct = (product) => setProductToDelete(product);

  const confirmDelete = async () => {
    if (productToDelete && productToDelete._id) {
      try {
        const response = await fetch(`/api/products/${productToDelete._id}`, { method: 'DELETE' });
        if (response.ok) {
          setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
          setProductToDelete(null);
        } else {
          alert('Failed to delete from database');
        }
      } catch (error) {
        console.error('Delete product error:', error);
        alert('Error connecting to database');
      }
    }
  };

  return (
    <div className="admin-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards' }}>
      <Helmet>
        <title>Admin Panel | Curated Corners</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
        <Link to="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </Link>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        {/* BLOG MANAGEMENT */}
        <div style={{ background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Blogs</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Create new articles and link products.</p>

          <form onSubmit={handleAddBlog}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleBlogImageUpload} style={{ ...inputStyle, padding: '8px' }} required />
            {newBlog.image && <img src={newBlog.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title</label>
            <input type="text" value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} style={inputStyle} required />

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category</label>
                <input type="text" value={newBlog.category} onChange={e => setNewBlog({ ...newBlog, category: e.target.value })} style={inputStyle} placeholder="e.g. Featured, Gaming" required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Read Time</label>
                <input type="text" value={newBlog.readTime} onChange={e => setNewBlog({ ...newBlog, readTime: e.target.value })} style={inputStyle} placeholder="e.g. 5 Min Read" required />
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Meta Description <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.85rem' }}>(SEO — max 160 chars)</span>
            </label>
            <textarea
              maxLength={160}
              value={newBlog.metaDescription}
              onChange={e => setNewBlog({ ...newBlog, metaDescription: e.target.value })}
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              placeholder="Short SEO description for Google search results..."
            />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-12px', marginBottom: '16px' }}>
              {newBlog.metaDescription.length}/160 characters
            </div>

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Tags <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '0.85rem' }}>(comma-separated)</span>
            </label>
            <input
              type="text"
              value={newBlog.tags}
              onChange={e => setNewBlog({ ...newBlog, tags: e.target.value })}
              style={inputStyle}
              placeholder="e.g. luxury, dark aesthetic, minimalist"
            />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Content (HTML Allowed)</label>
            <textarea value={newBlog.content} onChange={e => setNewBlog({ ...newBlog, content: e.target.value })} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} placeholder="<p>Write your article here...</p>" required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Link Products</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
              {products.map(p => (
                <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newBlog.linkedProducts.includes(p._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewBlog(prev => ({ ...prev, linkedProducts: [...prev.linkedProducts, p._id] }));
                      } else {
                        setNewBlog(prev => ({ ...prev, linkedProducts: prev.linkedProducts.filter(id => id !== p._id) }));
                      }
                    }}
                  />
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                </label>
              ))}
            </div>

            <button type="submit" style={{ width: '100%', padding: '16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
              Publish Blog
            </button>
          </form>

          <h3 style={{ fontSize: '1.5rem', margin: '32px 0 16px' }}>Existing Blogs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {blogs.map(blog => (
              <div key={blog._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{blog.title}</h4>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {blog.category} &bull; {blog.linkedProducts?.length || 0} Products Linked
                    {blog.slug && <span style={{ marginLeft: '8px', color: '#4ade80', fontSize: '0.8rem' }}>✓ /blog/{blog.slug}</span>}
                  </span>
                </div>
                <button onClick={() => handleDeleteBlog(blog._id)} style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCT MANAGEMENT */}
        <div style={{ background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Products</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Add a new curated product to the Shop.</p>

          <form onSubmit={handleAddProduct}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Product Image (Required)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '8px' }} required />
            {newProduct.image && <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title (Max 50 chars)</label>
            <input type="text" maxLength={50} value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} style={inputStyle} placeholder="e.g. Walnut Coffee Table" required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description (Max 150 chars)</label>
            <textarea maxLength={150} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Short compelling description..." required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Price</label>
            <input type="text" maxLength={15} value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={inputStyle} placeholder="e.g. $199" required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Affiliate Link (Required)</label>
            <input type="url" value={newProduct.link} onChange={e => setNewProduct({ ...newProduct, link: e.target.value })} style={inputStyle} placeholder="https://amazon.com/..." required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Schedule Publish Date (Optional)</label>
            <input type="datetime-local" value={newProduct.scheduledFor} onChange={e => setNewProduct({ ...newProduct, scheduledFor: e.target.value })} style={inputStyle} />

            <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--accent-glow)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '16px' }}>
              Add Product
            </button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />

          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Manage Existing Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {products.map(product => (
              <div key={product._id || product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={product.image} alt={product.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{product.title}</h4>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>{product.price}</span>
                    {product.scheduledFor && new Date(product.scheduledFor) > new Date() && (
                      <span style={{ color: '#ffb74d', fontSize: '0.8rem', marginTop: '4px', display: 'inline-block', background: 'rgba(255, 183, 77, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Scheduled: {new Date(product.scheduledFor).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDeleteProduct(product)} style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                  Delete
                </button>
              </div>
            ))}
            {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No products found.</p>}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bento-bg)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 68, 68, 0.3)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeUp 0.3s ease-out' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
              Are you sure you want to delete "<strong>{productToDelete.title}</strong>"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setProductToDelete(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ROOT APP — Data fetching + Route definitions
// ============================================================
function App() {
  const [blogs, setBlogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [visibleBlogsCount, setVisibleBlogsCount] = useState(9);
  const [visibleProductsCount, setVisibleProductsCount] = useState(6);

  useEffect(() => {
    fetch('/api/products?all=true')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(err => console.error('Failed to load products:', err));

    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBlogs(data); })
      .catch(err => console.error('Failed to load blogs:', err));
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeView
            blogs={blogs}
            visibleBlogsCount={visibleBlogsCount}
            setVisibleBlogsCount={setVisibleBlogsCount}
          />
        }
      />
      <Route
        path="/blog/:slug"
        element={<ArticleView blogs={blogs} />}
      />
      <Route
        path="/shop"
        element={
          <ShopView
            products={products}
            visibleProductsCount={visibleProductsCount}
            setVisibleProductsCount={setVisibleProductsCount}
          />
        }
      />
      <Route path="/about" element={<AboutView />} />
      <Route
        path="/admin"
        element={
          <AdminView
            blogs={blogs}
            setBlogs={setBlogs}
            products={products}
            setProducts={setProducts}
          />
        }
      />
      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

function HomeRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/', { replace: true }); }, [navigate]);
  return null;
}

export default App;
