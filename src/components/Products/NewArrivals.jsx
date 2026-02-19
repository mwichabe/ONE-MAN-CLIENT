import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ProductModal } from "../Common/ProductModal";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const PRIMARY = '#ea2e0e';
const API_URL = "https://one-man-server.onrender.com/api/admin/products";
const CART_API_URL = "https://one-man-server.onrender.com/api/cart";

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div style={{ background: '#fafafa', border: '1px solid #ebebeb', overflow: 'hidden' }}>
    <style>{`@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(200%); } }`}</style>
    <div style={{ aspectRatio: '3/4', background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)', animation: 'shimmer 1.4s infinite' }} />
    </div>
    <div style={{ padding: '16px 14px 20px' }}>
      <div style={{ height: 13, background: '#ebebeb', marginBottom: 8, width: '65%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)', animation: 'shimmer 1.4s infinite 0.1s' }} />
      </div>
      <div style={{ height: 18, background: '#ebebeb', width: '40%', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)', animation: 'shimmer 1.4s infinite 0.2s' }} />
      </div>
    </div>
  </div>
);

/* ─── Product Card ─── */
const ProductCard = ({ product, selectedSizes, onSizeSelect, onQuickAdd, addingProductId, onCardClick }) => {
  const isAdding = addingProductId === product._id;
  const isOneSize = product.sizes.length === 0;
  const currentSize = isOneSize ? 'One Size' : selectedSizes[product._id];
  const canAdd = product.stock > 0 && !isAdding && (isOneSize || currentSize);
  const [imgHover, setImgHover] = useState(false);

  return (
    <div
      style={{ background: '#fff', border: '1px solid #e8e8e8', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
      onClick={() => onCardClick(product)}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#111'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}
    >
      {/* Image */}
      <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f5f4f2', position: 'relative' }}
        onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)}>
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'transform 0.55s ease', transform: imgHover ? 'scale(1.05)' : 'scale(1)' }}
        />

        {/* Sold out overlay */}
        {product.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', border: '1px solid #fff', padding: '6px 14px' }}>Sold Out</span>
          </div>
        )}

        {/* NEW badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, background: PRIMARY, padding: '4px 10px' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff' }}>New</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 14px 18px' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#bbb', marginBottom: 5 }}>
          {product.category || 'Fashion'}
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 16, color: '#111', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </h3>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 12 }}>
          Ksh {product.price.toFixed(2)}
        </p>

        {/* Sizes */}
        {!isOneSize && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {product.sizes.map(size => (
              <button key={size}
                onClick={e => { e.stopPropagation(); onSizeSelect(product._id, size); }}
                disabled={product.stock === 0}
                style={{
                  padding: '4px 10px', fontFamily: "'DM Sans', sans-serif", fontSize: 10,
                  letterSpacing: '0.06em', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  border: currentSize === size ? `1.5px solid ${PRIMARY}` : '1.5px solid #e0e0e0',
                  background: currentSize === size ? PRIMARY : '#fff',
                  color: currentSize === size ? '#fff' : '#666',
                  transition: 'all 0.12s',
                }}>
                {size}
              </button>
            ))}
          </div>
        )}
        {isOneSize && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>One Size</p>
        )}

        {/* Add to cart */}
        <button
          onClick={e => { e.stopPropagation(); if (canAdd) onQuickAdd(product); }}
          disabled={!canAdd}
          style={{
            width: '100%', padding: '11px 0',
            background: canAdd ? '#111' : '#f0f0f0',
            border: 'none', cursor: canAdd ? 'pointer' : 'not-allowed',
            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: canAdd ? '#fff' : '#bbb',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => { if (canAdd) e.currentTarget.style.background = PRIMARY; }}
          onMouseLeave={e => { if (canAdd) e.currentTarget.style.background = '#111'; }}
        >
          {isAdding ? 'Adding…'
            : product.stock === 0 ? 'Sold Out'
            : !isOneSize && !currentSize ? 'Select Size'
            : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const NewArrivals = () => {
  const { isLoggedIn } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }

  useEffect(() => {
    const fetchNewArrivals = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const { data } = await axios.get(API_URL, {
          headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
        });
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sorted.slice(0, 10).map(p => ({
          ...p,
          imageUrls: p.imageUrls?.length ? p.imageUrls : ['https://placehold.co/600x800/f5f4f2/999999?text=No+Image'],
        })));
      } catch (err) {
        if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/signup'); }
        else setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, [navigate]);

  const filteredProducts = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t));
  }, [products, searchTerm]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleQuickAdd = async (product) => {
    if (addingProductId) return;
    if (!isLoggedIn) { showToast('Please log in to add items to cart.', 'error'); return; }
    const size = product.sizes.length > 0 ? selectedSizes[product._id] : 'One Size';
    if (product.sizes.length > 0 && !size) { showToast('Please select a size first.', 'error'); return; }

    setAddingProductId(product._id);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(CART_API_URL,
        { productId: product._id, size, quantity: 1, price: parseFloat(product.price.toFixed(2)) },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
      );
      if (res.status === 201) { showToast(`Added: ${product.name} (${size})`); refreshCart(); }
      else showToast('Failed to add to cart.', 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Network error.', 'error');
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <section style={{ background: '#fafafa', borderTop: '1px solid #ebebeb', padding: '72px 32px', fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .search-input { width: 100%; padding: 13px 44px 13px 16px; border: 1.5px solid #e0e0e0; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #111; outline: none; border-radius: 0; transition: border-color 0.2s; }
        .search-input:focus { border-color: #111; }
        .search-input::placeholder { color: #ccc; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: PRIMARY, marginBottom: 10 }}>◆ Just Dropped</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: '0.02em', lineHeight: 1, color: '#111' }}>New Arrivals</h2>
          </div>
          {/* Search */}
          <div style={{ position: 'relative', width: 260 }}>
            <input
              type="text" placeholder="Search arrivals…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="search-input"
            />
            <Search size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
            background: toast.type === 'success' ? '#f0fdf4' : '#fff5f5',
            border: `1.5px solid ${toast.type === 'success' ? '#22c55e' : PRIMARY}`,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            color: toast.type === 'success' ? '#166534' : '#b91c1c',
            animation: 'fadeIn 0.3s ease',
          }}>
            <span>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.msg}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                selectedSizes={selectedSizes}
                onSizeSelect={(id, size) => setSelectedSizes(p => ({ ...p, [id]: size }))}
                onQuickAdd={handleQuickAdd}
                addingProductId={addingProductId}
                onCardClick={p => { setSelectedProduct(p); setIsModalOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '72px 24px', border: '1px solid #ebebeb', background: '#fff' }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: '0.04em', color: '#ddd', marginBottom: 8 }}>No Results</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: '#aaa' }}>
              {searchTerm ? `Nothing matched "${searchTerm}"` : 'Check back soon for new drops.'}
            </p>
          </div>
        )}
      </div>

      {isModalOpen && <ProductModal product={selectedProduct} onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} />}
    </section>
  );
};

export default NewArrivals;