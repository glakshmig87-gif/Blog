import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
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
// FLOATING MORPHING PRODUCT WIDGET
// ============================================================
function FloatingProductWidget({ products }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!products || products.length === 0) return null;
  const activeProduct = products[currentIndex] || products[0];

  return (
    <div
      className={`floating-product-widget ${isHovered ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(prev => !prev)}
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 9999,
        background: 'rgba(18, 18, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: isHovered ? '24px' : '100px',
        padding: isHovered ? '20px' : '12px 24px',
        width: isHovered ? '320px' : 'auto',
        boxShadow: isHovered
          ? '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(142, 161, 149, 0.3)'
          : '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {!isHovered ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>🛍️</span>
          <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff' }}>
            Shop Featured Item {products.length > 1 ? `(${products.length})` : ''}
          </span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></span>
        </div>
      ) : (
        <div style={{ animation: 'fadeUp 0.3s ease-out forwards' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Featured Decor {products.length > 1 ? `(${currentIndex + 1}/${products.length})` : ''}
            </span>
            {products.length > 1 && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(prev => (prev > 0 ? prev - 1 : products.length - 1));
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(prev => (prev < products.length - 1 ? prev + 1 : 0));
                  }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>

          {activeProduct.image && (
            <div
              style={{
                height: '160px',
                backgroundImage: `url(${activeProduct.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '16px',
                marginBottom: '14px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            />
          )}

          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '6px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeProduct.title}
          </h4>

          {activeProduct.description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
              {activeProduct.description}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              {activeProduct.price}
            </span>
            <a
              href={activeProduct.link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '10px 20px',
                background: '#fff',
                color: '#000',
                borderRadius: '100px',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '0.85rem',
                transition: 'transform 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Buy Now &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ARTICLE VIEW
// ============================================================
function ArticleView({ blogs, products = [] }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`/api/blogs/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading article...</div>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/404" replace />;
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
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }} dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </article>

      {/* Floating Morphing Product Card Widget */}
      <FloatingProductWidget products={(post.linkedProducts && post.linkedProducts.length > 0) ? post.linkedProducts : products} />
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
                      style={{ backgroundImage: `url(/api/blogs/slug/${blog.slug || blog._id}/image)` }}
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

  const [editingBlogId, setEditingBlogId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

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
    setIsSubmittingBlog(true);
    try {
      const isEditing = !!editingBlogId;
      const url = isEditing ? `/api/blogs/${editingBlogId}` : '/api/blogs';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBlog,
          tags: newBlog.tags ? (typeof newBlog.tags === 'string' ? newBlog.tags.split(',').map(t => t.trim()).filter(Boolean) : newBlog.tags) : []
        })
      });
      if (response.ok) {
        const savedBlog = await response.json();
        if (isEditing) {
          setBlogs(prev => prev.map(b => b._id === editingBlogId ? savedBlog : b));
          setEditingBlogId(null);
        } else {
          setBlogs(prev => [...prev, savedBlog]);
        }
        setNewBlog({ title: '', category: '', readTime: '', image: '', content: '', metaDescription: '', tags: '', linkedProducts: [] });
        alert(isEditing ? 'Blog updated successfully!' : 'Blog saved successfully!');
      } else {
        alert(isEditing ? 'Failed to update blog.' : 'Failed to save blog.');
      }
    } catch (error) {
      console.error('Add/Update blog error:', error);
      alert('Error connecting to database');
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const startEditBlog = async (blog) => {
    try {
      const res = await fetch(`/api/blogs/slug/${blog.slug || blog._id}`);
      if (!res.ok) throw new Error('Failed to fetch full blog data');
      const fullBlog = await res.json();
      
      setEditingBlogId(fullBlog._id);
      setNewBlog({
        title: fullBlog.title || '',
        category: fullBlog.category || '',
        readTime: fullBlog.readTime || '',
        image: fullBlog.image || '',
        content: fullBlog.content || '',
        metaDescription: fullBlog.metaDescription || '',
        tags: fullBlog.tags ? (Array.isArray(fullBlog.tags) ? fullBlog.tags.join(', ') : fullBlog.tags) : '',
        linkedProducts: fullBlog.linkedProducts ? fullBlog.linkedProducts.map(p => p._id || p) : []
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Error fetching full blog details for editing.');
    }
  };

  const cancelEditBlog = () => {
    setEditingBlogId(null);
    setNewBlog({ title: '', category: '', readTime: '', image: '', content: '', metaDescription: '', tags: '', linkedProducts: [] });
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
    setIsSubmittingProduct(true);
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
    } finally {
      setIsSubmittingProduct(false);
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
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{editingBlogId ? 'Edit Blog' : 'Manage Blogs'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{editingBlogId ? 'Update this article.' : 'Create new articles and link products.'}</p>

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

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Content</label>
            <textarea value={newBlog.content} onChange={e => setNewBlog({ ...newBlog, content: e.target.value })} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} placeholder="Write your article here..." required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Link Products</label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: newBlog.linkedProducts.length ? '8px' : '0' }}>
                {newBlog.linkedProducts.map(productId => {
                  const p = products.find(prod => prod._id === productId);
                  if (!p) return null;
                  return (
                    <div key={productId} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.9rem' }}>
                      {p.title}
                      <button type="button" onClick={() => setNewBlog(prev => ({ ...prev, linkedProducts: prev.linkedProducts.filter(id => id !== productId) }))} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
              <input
                type="text"
                value={productSearch}
                onChange={e => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
                onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                style={inputStyle}
                placeholder="Search and select products to link..."
              />
              {showProductDropdown && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bento-bg)', border: '1px solid var(--bento-border)', borderRadius: '12px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, backdropFilter: 'blur(10px)' }}>
                  {products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()) && !newBlog.linkedProducts.includes(p._id)).length > 0 ? (
                    products
                      .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()) && !newBlog.linkedProducts.includes(p._id))
                      .map(p => (
                        <div
                          key={p._id}
                          onClick={() => {
                            setNewBlog(prev => ({ ...prev, linkedProducts: [...prev.linkedProducts, p._id] }));
                            setProductSearch('');
                            setShowProductDropdown(false);
                          }}
                          style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '0.95rem', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {p.title}
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                      No matching products found
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button type="button" onClick={() => setIsPreviewOpen(true)} style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                Preview Article
              </button>
              <button
                type="submit"
                disabled={isSubmittingBlog}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: isSubmittingBlog ? 'rgba(59, 130, 246, 0.6)' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '100px',
                  fontWeight: 'bold',
                  cursor: isSubmittingBlog ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {isSubmittingBlog ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    {editingBlogId ? 'Updating Blog...' : 'Publishing Blog...'}
                  </>
                ) : (
                  editingBlogId ? 'Update Blog' : 'Publish Blog'
                )}
              </button>
              {editingBlogId && (
                <button type="button" onClick={cancelEditBlog} style={{ flex: 1, padding: '16px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
                  Cancel
                </button>
              )}
            </div>
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEditBlog(blog)} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBlog(blog._id)} style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Delete
                  </button>
                </div>
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

            <button
              type="submit"
              disabled={isSubmittingProduct}
              style={{
                width: '100%',
                padding: '16px',
                background: isSubmittingProduct ? 'rgba(142, 161, 149, 0.4)' : 'var(--accent-glow)',
                color: '#fff',
                border: 'none',
                borderRadius: '100px',
                fontWeight: 'bold',
                cursor: isSubmittingProduct ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isSubmittingProduct ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Adding Product...
                </>
              ) : (
                'Add Product'
              )}
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

      {/* Preview Article Modal */}
      {isPreviewOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-color)', zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Article Preview</h2>
            <button type="button" onClick={() => setIsPreviewOpen(false)} style={{ background: 'var(--accent-glow)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold' }}>
              Close Preview
            </button>
          </div>
          <div style={{ padding: '0', maxWidth: '800px', margin: '0 auto' }}>
            <article className="article-container">
              <div className="article-hero" style={{ backgroundImage: `url(${getSafeImageUrl(newBlog.image)})` }}>
                <div className="article-hero-overlay"></div>
                <div className="article-hero-content">
                  <span className="article-category">{newBlog.category || 'Category'}</span>
                  <h1>{newBlog.title || 'Untitled Article'}</h1>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.85rem', opacity: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <time style={{ color: '#fff' }}>Just now</time>
                    <span style={{ color: '#fff' }}>•</span>
                    <span style={{ color: '#fff' }}>{newBlog.readTime || '3 min read'}</span>
                    <span style={{ color: '#fff' }}>•</span>
                    <span style={{ color: '#fff' }}>Curated Corners</span>
                  </div>
                </div>
              </div>
              <div className="article-body">
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }} dangerouslySetInnerHTML={{ __html: newBlog.content || '<p style="color: var(--text-muted)">Content will appear here...</p>' }} />
              </div>
            </article>
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
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(err => console.error('Failed to load products:', err.message));

    fetch('/api/blogs')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setBlogs(data); })
      .catch(err => console.error('Failed to load blogs:', err.message));
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
        element={<ArticleView blogs={blogs} products={products} />}
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
      {/* Catch-all: 404 page */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
}

// ============================================================
// 404 NOT FOUND VIEW
// ============================================================
function NotFoundView() {
  return (
    <div className="not-found-view" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', animation: 'fadeUp 0.6s ease-out forwards', position: 'relative' }}>
      <Helmet>
        <title>404 - Room Not Found | Curated Corners</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Decorative architectural elements */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '1px', height: '80%', background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0))' }}></div>
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '1px', height: '80%', background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0))' }}></div>

      <h1 style={{ fontSize: 'clamp(6rem, 15vw, 10rem)', margin: '0', fontWeight: 'bold', color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.3)', letterSpacing: '8px' }}>404</h1>
      
      <div style={{ background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)', marginTop: '-40px', position: 'relative', zIndex: 2, maxWidth: '500px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>This room is empty.</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
          The space you're looking for doesn't exist, has been demolished, or is undergoing a complete architectural redesign.
        </p>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', background: 'var(--accent-glow)', color: '#fff', textDecoration: 'none', borderRadius: '100px', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.3s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Return to Foyer
        </Link>
      </div>
    </div>
  );
}

export default App;
