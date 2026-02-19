import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const PRIMARY = '#ea2e0e';
const PRODUCT_API_BASE_URL = 'https://one-man-server.onrender.com/api/admin/products';
const CART_API_URL = 'https://one-man-server.onrender.com/api/cart';
const PLACEHOLDER = 'https://placehold.co/800x1000/f5f4f2/999999?text=No+Image';
const DISCOUNT_RATE = 0.20;

/* ─── Skeleton ─── */
const DetailSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, minHeight: 600, background: '#fff' }}>
    <style>{`@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(200%); } }`}</style>
    {[0,1].map(i => (
      <div key={i} style={{ background: '#f5f4f2', position: 'relative', overflow: 'hidden', aspectRatio: i === 0 ? '3/4' : 'auto', padding: i === 1 ? 48 : 0 }}>
        {i === 0 && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)', animation: 'shimmer 1.4s infinite' }} />}
        {i === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[60, 40, 200, 120, 80].map((w, j) => (
              <div key={j} style={{ height: j === 0 ? 48 : j === 1 ? 32 : j === 2 ? 14 : j === 3 ? 44 : 52, width: `${w}%`, background: '#ebebeb', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)', animation: `shimmer 1.4s infinite ${j*0.1}s` }} />
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

const ProductDetail = () => {
  const { isLoggedIn } = useAuth();
  const { refreshCart } = useCart();
  const { id } = useParams();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [isAdding, setIsAdding]       = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true); setError(null);
      const timeout = setTimeout(() => { setLoading(false); setError('Request timed out. Please try again.'); }, 10000);
      try {
        let pid = id;
        if (!pid) {
          const r = await fetch(`${PRODUCT_API_BASE_URL}/random`);
          if (!r.ok) throw new Error('Could not fetch product');
          pid = (await r.json())._id;
        }
        const res = await fetch(`${PRODUCT_API_BASE_URL}/${pid}`);
        clearTimeout(timeout);
        if (res.status === 404) { setProduct(null); setError('Product not found'); return; }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        if (!data?.name) { setProduct(null); setError('Product not found'); return; }
        setProduct(data);
        setSelectedImage(data.imageUrls?.[0] || PLACEHOLDER);
      } catch (err) {
        clearTimeout(timeout);
        setError(err.message || 'Failed to load product.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { showToast('Please log in to add items to cart.', 'error'); return; }
    if (product?.sizes?.length > 0 && !selectedSize) { showToast('Please select a size first.', 'error'); return; }

    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const finalSize = selectedSize || (product.sizes.length === 0 ? 'One Size' : null);
      const priceToSend = parseFloat((product.price * (1 - DISCOUNT_RATE)).toFixed(2));
      const res = await fetch(CART_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id, size: finalSize, quantity: 1, price: priceToSend }),
      });
      const data = await res.json();
      if (res.ok) { showToast(data.message || 'Added to cart!'); refreshCart(); }
      else showToast(data.message || 'Failed to add to cart.', 'error');
    } catch {
      showToast('A network error occurred.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  /* ── Not logged in ── */
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: '48px 32px', fontFamily: "'Cormorant Garamond', serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderTop: `3px solid ${PRIMARY}`, padding: '48px 44px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: '#f0f0f0', lineHeight: 1, marginBottom: 16 }}>🔒</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: PRIMARY, marginBottom: 12 }}>Access Required</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: '0.03em', color: '#111', marginBottom: 8 }}>Login to Continue</h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15, color: '#888', marginBottom: 32, lineHeight: 1.65 }}>
            You need to be logged in to view product details and make purchases.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/login" style={{ display: 'block', padding: '13px', background: '#111', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = PRIMARY} onMouseLeave={e => e.currentTarget.style.background = '#111'}>Log In →</Link>
            <Link to="/signup" style={{ display: 'block', padding: '12px', background: 'transparent', color: '#111', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', border: '1.5px solid #e0e0e0', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#111'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#e0e0e0'; }}>Create Account</Link>
            <Link to="/" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#bbb', textDecoration: 'none', marginTop: 4, display: 'block' }}>← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <DetailSkeleton />
    </div>
  );

  /* ── Error / Not found ── */
  if (error || !product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: '48px 32px', fontFamily: "'Cormorant Garamond', serif" }}>
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderTop: `3px solid ${PRIMARY}`, padding: '48px 44px', maxWidth: 400, textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: PRIMARY, marginBottom: 12 }}>
            {error === 'Product not found' ? 'Not Found' : 'Error'}
          </p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#111', marginBottom: 8 }}>
            {error === 'Product not found' ? 'Product Not Found' : 'Something Went Wrong'}
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15, color: '#888', marginBottom: 32 }}>{error}</p>
          <Link to="/shop" style={{ display: 'inline-block', padding: '13px 32px', background: '#111', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  const { name, description, imageUrls, sizes, stock, category, price } = product;
  const images = imageUrls?.length ? imageUrls : [PLACEHOLDER];
  const originalPrice = price;
  const discountedPrice = originalPrice * (1 - DISCOUNT_RATE);
  const isAvailable = stock > 0;
  const isButtonDisabled = isAdding || !isAvailable || (sizes.length > 0 && !selectedSize);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: '48px 32px', fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .thumb-img { cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
        .thumb-img:hover { border-color: #111; }
        .thumb-img.active { border-color: ${PRIMARY}; }
        .size-btn { padding: 10px 18px; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.06em; border: 1.5px solid #e0e0e0; background: #fff; cursor: pointer; transition: all 0.15s; color: #666; }
        .size-btn:hover:not(:disabled) { border-color: #111; color: #111; }
        .size-btn.selected { border-color: ${PRIMARY}; background: ${PRIMARY}; color: #fff; }
        .size-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .add-btn { width: 100%; padding: 16px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.2s; }
        .add-btn:not(:disabled):hover { transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#bbb', letterSpacing: '0.08em' }}>
          <Link to="/app" style={{ color: '#bbb', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#bbb'}>Home</Link>
          <span>/</span>
          <Link to="/shop" style={{ color: '#bbb', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#bbb'}>Shop</Link>
          <span>/</span>
          <span style={{ color: '#888' }}>{name}</span>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: '#fff', border: '1px solid #e8e8e8', animation: 'fadeIn 0.5s ease both' }}>

          {/* ── Left: Images ── */}
          <div style={{ borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
            {/* Main image */}
            <div style={{ flex: 1, overflow: 'hidden', background: '#f5f4f2', aspectRatio: '3/4' }}>
              <img src={selectedImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'opacity 0.25s' }} />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ padding: '16px', display: 'flex', gap: 8, borderTop: '1px solid #ebebeb', overflowX: 'auto' }}>
                {images.map((url, i) => (
                  <img key={i} src={url} alt={`${name} ${i+1}`} onClick={() => setSelectedImage(url)}
                    className={`thumb-img ${selectedImage === url ? 'active' : ''}`}
                    style={{ width: 68, height: 68, objectFit: 'cover', flexShrink: 0 }} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div style={{ padding: '48px 48px 40px', display: 'flex', flexDirection: 'column' }}>
            {/* Category */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: PRIMARY, marginBottom: 12 }}>◆ {category || 'Fashion'}</p>

            {/* Name */}
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 4vw, 52px)', letterSpacing: '0.02em', lineHeight: 0.95, color: '#111', marginBottom: 28 }}>{name}</h1>

            {/* Pricing */}
            <div style={{ borderTop: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb', padding: '20px 0', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 8 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 30, fontWeight: 600, color: '#111' }}>
                  Ksh {discountedPrice.toFixed(2)}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: '#bbb', textDecoration: 'line-through' }}>
                  Ksh {originalPrice.toFixed(2)}
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#22c55e', background: '#f0fdf4', padding: '4px 10px', border: '1px solid #bbf7d0' }}>
                  SAVE {(DISCOUNT_RATE*100).toFixed(0)}%
                </span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: '0.06em', color: isAvailable ? '#22c55e' : PRIMARY, fontWeight: 500 }}>
                {isAvailable ? `✓ In Stock — ${stock} items available` : '✕ Currently Sold Out'}
              </p>
            </div>

            {/* Toast */}
            {toast && (
              <div style={{
                padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
                background: toast.type === 'success' ? '#f0fdf4' : '#fff5f5',
                border: `1.5px solid ${toast.type === 'success' ? '#22c55e' : PRIMARY}`,
                fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                color: toast.type === 'success' ? '#166534' : '#b91c1c',
                animation: 'fadeIn 0.3s ease',
              }}>
                {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>Description</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 16, color: '#555', lineHeight: 1.8 }}>{description}</p>
            </div>

            {/* Size selection */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888' }}>
                  {sizes.length > 0 ? 'Select Size' : 'Size'}
                </p>
                {selectedSize && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: PRIMARY, letterSpacing: '0.1em' }}>Selected: {selectedSize}</p>}
              </div>

              {sizes.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} disabled={!isAvailable}
                      className={`size-btn ${selectedSize === size ? 'selected' : ''}`}>
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', letterSpacing: '0.06em' }}>One Size Fits All</span>
              )}
            </div>

            {/* Add to cart */}
            <button onClick={handleAddToCart} disabled={isButtonDisabled} className="add-btn"
              style={{
                background: isButtonDisabled ? '#f0f0f0' : '#111',
                color: isButtonDisabled ? '#bbb' : '#fff',
                cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                marginBottom: 12,
              }}
              onMouseEnter={e => { if (!isButtonDisabled) e.currentTarget.style.background = PRIMARY; }}
              onMouseLeave={e => { if (!isButtonDisabled) e.currentTarget.style.background = '#111'; }}
            >
              {isAdding ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Adding to Cart
                </span>
              ) : !isAvailable ? 'Notify Me When Available'
                : sizes.length > 0 && !selectedSize ? 'Select a Size to Continue'
                : 'Add to Cart →'}
            </button>

            {/* Back link */}
            <Link to="/shop" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#bbb', textDecoration: 'none', textAlign: 'center', letterSpacing: '0.06em', transition: 'color 0.15s', display: 'block' }}
              onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#bbb'}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;