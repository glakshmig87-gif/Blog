import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './article.css';

function App() {
  const [activePostId, setActivePostId] = useState(null);
  const [activeView, setActiveView] = useState('home');

  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);

  const [visibleBlogsCount, setVisibleBlogsCount] = useState(9);
  const [visibleProductsCount, setVisibleProductsCount] = useState(6);

  useEffect(() => {
    // Fetch products
    fetch('/api/products?all=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error("Failed to load products from database:", err));

    // Fetch blogs
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data);
      })
      .catch(err => console.error("Failed to load blogs from database:", err));
  }, []);

  const [newBlog, setNewBlog] = useState({
    title: '',
    category: '',
    readTime: '',
    image: '',
    content: '',
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

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);



  // Handle URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      let route = window.location.hash.replace('#', '');
      const path = window.location.pathname.replace('/', '');
      
      if (!route && path) {
        route = path;
      }

      if (route === 'buy') {
        setActiveView('buy');
        setActivePostId(null);
      } else if (route === 'about') {
        setActiveView('about');
        setActivePostId(null);
      } else if (route === 'admin') {
        setActiveView('admin');
        setActivePostId(null);
      } else if (route.startsWith('post-')) {
        const id = route.split('post-')[1];
        if (id) {
          setActivePostId(id);
          setActiveView('home');
        }
      } else {
        setActiveView('home');
        setActivePostId(null);
      }
    };
    
    // Check initial hash on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync state changes back to URL hash and scroll to top
  useEffect(() => {
    if (activePostId !== null) {
      if (window.location.hash !== `#post-${activePostId}`) {
        window.location.hash = `post-${activePostId}`;
      }
    } else if (activeView === 'buy') {
      if (window.location.hash !== '#buy') window.location.hash = 'buy';
    } else if (activeView === 'about') {
      if (window.location.hash !== '#about') window.location.hash = 'about';
    } else if (activeView === 'admin') {
      if (window.location.hash !== '#admin') window.location.hash = 'admin';
    } else {
      // Clear hash cleanly for home
      if (window.location.hash) {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
      }
    }
    window.scrollTo(0, 0);
  }, [activePostId, activeView]);

  const handleViewImage = (url) => {
    window.open(url, '_blank');
  };

  // If a post is active, render the article view
  const activeBlog = activePostId ? blogs.find(b => b._id === activePostId) : null;
  if (activeBlog) {
    const post = activeBlog;
    // Strip HTML from content for meta description
    const plainTextContent = post.content ? post.content.replace(new RegExp('<[^>]*>', 'g'), '').substring(0, 150) + '...' : 'Discover luxury interior design and homedecor curated specifically for ' + post.category;
    
    return (
      <div className="article-view">
        <Helmet>
          <title>{post.title} | Curated Corners</title>
          <meta name="description" content={plainTextContent} />
          <meta name="keywords" content={`homedecor, ${post.category}, interior design, luxury decor`} />
          <meta property="og:title" content={`${post.title} | Curated Corners`} />
          <meta property="og:description" content={plainTextContent} />
          <meta property="og:image" content={post.image} />
          <meta property="og:type" content="article" />
          <meta property="twitter:title" content={`${post.title} | Curated Corners`} />
          <meta property="twitter:description" content={plainTextContent} />
          <meta property="twitter:image" content={post.image} />
          <link rel="canonical" href={`https://curatedcorners.com/#post-${post._id}`} />
        </Helmet>
        <div className="navbar-wrapper">
          <nav className="navbar-pill">
            <a href="/" className="back-btn" style={{ textDecoration: 'none' }}>
              &larr; Back to Grid
            </a>
            <span className="navbar-divider">|</span>
            <button className="download-btn" onClick={() => handleViewImage(post.image)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              View Full Image
            </button>
          </nav>
        </div>
        
        <article className="article-container">
          <div className="article-hero" style={{ backgroundImage: `url(${post.image})` }}>
            <div className="article-hero-overlay"></div>
            <div className="article-hero-content">
              <span className="article-category">{post.category}</span>
              <h1>{post.title}</h1>
            </div>
          </div>
          <div className="article-body">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>
      </div>
    );
  }

  if (activeView === 'buy') {
    return (
      <div className="buy-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards' }}>
        <Helmet>
          <title>Shop The Aesthetic | Curated Corners Homedecor</title>
          <meta name="description" content="Shop exclusive homedecor, luxury furniture, and aesthetic lighting hand-selected by our architects. Elevate your space with Curated Corners." />
          <meta name="keywords" content="homedecor, luxury furniture, buy aesthetic decor, shop interior design, modern lighting" />
          <meta property="og:title" content="Shop The Aesthetic | Curated Corners Homedecor" />
          <link rel="canonical" href="https://curatedcorners.com/#buy" />
        </Helmet>
        <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
          <a href="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </a>
        </div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '16px' }}>Shop The Aesthetic</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
            Curated furniture, lighting, and decor to elevate your space. Every piece is hand-selected by our architects.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', textAlign: 'left' }}>
            {products.filter(p => !p.scheduledFor || new Date(p.scheduledFor) <= new Date()).slice(0, visibleProductsCount).map((product) => (
              <div key={product._id || product.id} style={{ background: 'var(--bento-bg)', borderRadius: '24px', border: '1px solid var(--bento-border)', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease' }}>
                <div style={{ height: '250px', backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} role="img" aria-label={`Image of ${product.title}`}></div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{product.title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5', minHeight: '40px', wordWrap: 'break-word' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{product.price}</span>
                    <a href={product.link} target="_blank" rel="noreferrer" style={{ padding: '12px 24px', background: '#fff', color: '#000', borderRadius: '100px', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}>Buy Now</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.filter(p => !p.scheduledFor || new Date(p.scheduledFor) <= new Date()).length > visibleProductsCount && (
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

  if (activeView === 'admin') {
    const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', marginBottom: '16px' };

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
          <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
            <a href="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Home
            </a>
          </div>

          <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Login</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter credentials to access the panel.</p>
            <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
              <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} style={inputStyle} required />

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={inputStyle} required />

              <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--accent-glow)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '16px' }}>Login</button>
            </form>
          </div>
        </div>
      );
    }

    const compressImage = (file, callback) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 1200;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to 70% quality webp or jpeg
          const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.7);
          callback(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        compressImage(file, (compressedString) => {
          setNewProduct(prev => ({ ...prev, image: compressedString }));
        });
      }
    };

    const handleAddProduct = async (e) => {
      e.preventDefault();
      if (!newProduct.title || !newProduct.image || !newProduct.link) {
        alert("Please fill all required fields (Image, Title, Link).");
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
          alert("Product saved to MongoDB successfully!");
        } else {
          alert("Failed to save product.");
        }
      } catch (error) {
        console.error(error);
        alert("Error connecting to database");
      }
    };

    const handleBlogImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        compressImage(file, (compressedString) => {
          setNewBlog(prev => ({ ...prev, image: compressedString }));
        });
      }
    };

    const handleAddBlog = async (e) => {
      e.preventDefault();
      if (!newBlog.title || !newBlog.category || !newBlog.readTime || !newBlog.image || !newBlog.content) {
        alert("Please fill all required blog fields.");
        return;
      }

      try {
        const response = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBlog)
        });

        if (response.ok) {
          const savedBlog = await response.json();
          setBlogs(prev => [...prev, savedBlog]);
          setNewBlog({ title: '', category: '', readTime: '', image: '', content: '', linkedProducts: [] });
          alert("Blog saved successfully!");
        } else {
          alert("Failed to save blog.");
        }
      } catch (error) {
        console.error(error);
        alert("Error connecting to database");
      }
    };

    const handleDeleteBlog = async (blogId) => {
      if (window.confirm("Are you sure you want to delete this blog?")) {
        try {
          const response = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
          if (response.ok) {
            setBlogs(prev => prev.filter(b => b._id !== blogId));
          } else {
            alert("Failed to delete blog.");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    const handleDeleteProduct = (product) => {
      setProductToDelete(product);
    };

    const confirmDelete = async () => {
      if (productToDelete && productToDelete._id) {
        try {
          const response = await fetch(`/api/products/${productToDelete._id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
            setProductToDelete(null);
          } else {
            alert("Failed to delete from database");
          }
        } catch (error) {
          console.error(error);
          alert("Error connecting to database");
        }
      }
    };
    
    return (
      <div className="admin-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards' }}>
        <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
          <a href="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </a>
        </div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
          {/* BLOG MANAGEMENT SECTION */}
          <div style={{ background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Blogs</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Create new articles and link products.</p>
            
            <form onSubmit={handleAddBlog}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cover Image</label>
              <input type="file" accept="image/*" onChange={handleBlogImageUpload} style={{ ...inputStyle, padding: '8px' }} required />
              {newBlog.image && <img src={newBlog.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title</label>
              <input type="text" value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} style={inputStyle} required />

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Category</label>
                  <input type="text" value={newBlog.category} onChange={e => setNewBlog({...newBlog, category: e.target.value})} style={inputStyle} placeholder="e.g. Featured, Gaming" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Read Time</label>
                  <input type="text" value={newBlog.readTime} onChange={e => setNewBlog({...newBlog, readTime: e.target.value})} style={inputStyle} placeholder="e.g. 5 Min Read" required />
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Content (HTML Allowed)</label>
              <textarea value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} placeholder="<p>Write your article here...</p>" required />

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Link Products</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                {products.map(p => (
                  <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newBlog.linkedProducts.includes(p._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewBlog(prev => ({...prev, linkedProducts: [...prev.linkedProducts, p._id]}));
                        } else {
                          setNewBlog(prev => ({...prev, linkedProducts: prev.linkedProducts.filter(id => id !== p._id)}));
                        }
                      }}
                    />
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                  </label>
                ))}
              </div>

              <button type="submit" style={{ width: '100%', padding: '16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>Publish Blog</button>
            </form>

            <h2 style={{ fontSize: '1.5rem', margin: '32px 0 16px' }}>Existing Blogs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {blogs.map(blog => (
                <div key={blog._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{blog.title}</h4>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{blog.category} &bull; {blog.linkedProducts.length} Products Linked</span>
                  </div>
                  <button onClick={() => handleDeleteBlog(blog._id)} style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT MANAGEMENT SECTION */}
          <div style={{ background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Products</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Add a new curated product to the Shop.</p>
          
          <form onSubmit={handleAddProduct}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Product Image (Required)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, padding: '8px' }} required />
            {newProduct.image && <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />}

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title (Max 50 chars)</label>
            <input type="text" maxLength={50} value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} style={inputStyle} placeholder="e.g. Walnut Coffee Table" required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description (Max 150 chars)</label>
            <textarea maxLength={150} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Short compelling description..." required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Price</label>
            <input type="text" maxLength={15} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={inputStyle} placeholder="e.g. $199" required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Affiliate Link (Required)</label>
            <input type="url" value={newProduct.link} onChange={e => setNewProduct({...newProduct, link: e.target.value})} style={inputStyle} placeholder="https://amazon.com/..." required />

            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Schedule Publish Date (Optional)</label>
            <input type="datetime-local" value={newProduct.scheduledFor} onChange={e => setNewProduct({...newProduct, scheduledFor: e.target.value})} style={inputStyle} />

            <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--accent-glow)', color: '#fff', border: 'none', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', marginTop: '16px' }}>Add Product</button>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '40px 0' }} />
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Manage Existing Products</h2>
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
                        Scheduled for: {new Date(product.scheduledFor).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDeleteProduct(product)} style={{ background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', border: '1px solid rgba(255, 68, 68, 0.5)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>Delete</button>
              </div>
            ))}
            {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No products found.</p>}
          </div>
          </div>
        </div>

        {productToDelete && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bento-bg)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 68, 68, 0.3)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeUp 0.3s ease-out' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Delete Product?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>Are you sure you want to delete "<strong>{productToDelete.title}</strong>"? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={() => setProductToDelete(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeView === 'about') {
    return (
      <div className="about-view" style={{ minHeight: '100vh', position: 'relative', padding: '100px 24px', animation: 'fadeUp 0.6s ease-out forwards' }}>
        <Helmet>
          <title>About Us | Curated Corners</title>
          <meta name="description" content="Learn about Curated Corners, our mission in neuro-architecture, and our passion for dark luxury homedecor." />
          <meta name="keywords" content="about curated corners, homedecor mission, neuro-architecture, luxury interior design" />
          <link rel="canonical" href="https://curatedcorners.com/#about" />
        </Helmet>
        <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
          <a href="/" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </a>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '24px' }}>About Curated Corners</h1>
          <div style={{ color: '#D1D1D6', fontSize: '1.25rem', lineHeight: '1.8', textAlign: 'left', background: 'var(--bento-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--bento-border)', backdropFilter: 'blur(10px)' }}>
            <p style={{ marginBottom: '24px' }}>
              At <strong>Curated Corners</strong>, we believe that the spaces we inhabit shape the way we think, feel, and create. Our mission is to document and design the world's most inspiring interiors, merging dark luxury aesthetics with high-functional modernism.
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

  // Otherwise, render the Bento Grid
  return (
    <>
      <Helmet>
        <title>Curated Corners | Luxury Interior Design & Homedecor</title>
        <meta name="description" content="Discover luxury interior design, modern homedecor, and neuro-architecture. Shop our exclusive collection of aesthetic furniture and decor." />
        <meta name="keywords" content="homedecor, interior design, modern furniture, luxury living spaces, neuro-architecture, curated spaces, aesthetic decor" />
        <link rel="canonical" href="https://curatedcorners.com/" />
      </Helmet>
      <div className="navbar-wrapper">
        <nav className="navbar-pill">
          <a href="#" className="logo-link">
            <img src="/logo.png" alt="Curated Corners Logo" className="logo" />
          </a>
          <ul className="nav-links">
            <li><a href="#">Discover</a></li>
            <li><a href="#buy">Buy</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </div>

      <main className="bento-section">
        <div className="container">
          <div className="bento-header">
            <h1>Curted Corners.</h1>
            <p>A new spatial way to explore curated spaces and design philosophy.</p>
          </div>

          <div className="bento-grid">
            {blogs.slice(0, visibleBlogsCount).map((blog, index) => {
              const gridClasses = [
                'box-large', 'box-tall', 'box-small', 'box-small', 
                'box-wide', 'box-small', 'box-tall', 'box-small', 'box-wide'
              ];
              const boxClass = gridClasses[index % gridClasses.length];
              
              return (
                <article 
                  key={blog._id}
                  className={`bento-box ${boxClass}`} 
                  onClick={() => setActivePostId(blog._id)} 
                  style={{ animationDelay: `${0.1 * ((index % 9) + 1)}s` }}
                >
                  <div className="box-image-bg" style={{ backgroundImage: `url(${blog.image})` }} role="img" aria-label={`Image for ${blog.title}`}></div>
                  <div className="box-gradient-overlay" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.1) 60%, rgba(5,5,5,0) 100%)' }}></div>
                  <div className="box-category">{blog.category} &bull; {blog.readTime}</div>
                  <div className="box-content">
                    <h2 className={boxClass === 'box-large' ? "box-title" : "box-title"}>{blog.title}</h2>
                    { (boxClass === 'box-large' || boxClass === 'box-wide') && blog.content && (
                      <p className="box-excerpt">
                         {blog.content.replace(new RegExp('<[^>]*>', 'g'), '').substring(0, 80)}...
                      </p>
                    )}
                  </div>
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

export default App;
