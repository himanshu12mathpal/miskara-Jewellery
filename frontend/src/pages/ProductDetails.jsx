import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import { FiShoppingBag, FiArrowLeft, FiMinus, FiPlus, FiHeart, FiStar, FiUser } from 'react-icons/fi';

const fmt = (p) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(p);

function Stars({ rating, size=14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <FiStar key={n} size={size}
          fill={rating >= n ? '#2d6147' : 'none'}
          stroke={rating >= n ? '#2d6147' : '#c4dbc9'}
          strokeWidth={1.5} />
      ))}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);

  useEffect(() => {
    productService.getById(id)
      .then(({ data }) => setProduct(data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, qty);
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!product) return null;

  const img = product.images?.[activeImg]?.url || 'https://placehold.co/600x700/edf5ef/1a3c2e?text=Miskara';

  return (
    <div style={{ background:'#f8f5f0', minHeight:'100vh', paddingTop:'96px', paddingBottom:'80px' }}>
      <div className="max-w-7xl mx-auto px-6">

        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-ui font-medium text-[11px] tracking-[2px] uppercase text-muted hover:text-forest transition-colors mb-10">
          <FiArrowLeft size={14} /> Back to Collections
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden"
              style={{ aspectRatio:'4/5', background:'rgba(237,245,239,0.5)', border:'1px solid rgba(26,60,46,0.08)', boxShadow:'0 12px 40px rgba(26,60,46,0.08)' }}>
              <img src={img} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-3">
                {product.images.map((im, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden transition-all"
                    style={{
                      border: activeImg === i ? '2px solid #1a3c2e' : '2px solid rgba(26,60,46,0.1)',
                      boxShadow: activeImg === i ? '0 4px 12px rgba(26,60,46,0.15)' : 'none',
                    }}>
                    <img src={im.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pt-2">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="tag-green">{product.category}</span>
              <span className="tag-green">{product.gender}</span>
              {product.stock === 0 && <span className="badge-red">Sold Out</span>}
              {product.stock > 0 && product.stock < 5 && <span className="badge-amber">Only {product.stock} left</span>}
            </div>

            <h1 className="font-serif italic text-ink mb-3 leading-tight" style={{ fontSize:'clamp(2rem,4vw,3rem)', fontWeight:400 }}>
              {product.name}
            </h1>

            {product.numReviews > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <Stars rating={Math.round(product.rating)} size={15} />
                <span className="font-ui font-semibold text-sm" style={{ color:'#1a3c2e' }}>{product.rating}</span>
                <span className="font-ui text-xs text-muted">({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})</span>
              </div>
            )}

            <p className="font-serif italic mb-4" style={{ fontSize:'2rem', color:'#1a3c2e', fontWeight:400 }}>{fmt(product.price)}</p>

            {product.material && (
              <p className="font-ui text-xs text-muted tracking-[2px] uppercase mb-6">
                Material: <span className="text-ink normal-case tracking-normal font-medium">{product.material}</span>
              </p>
            )}

            <div className="mb-6"><span className="accent-line" /></div>

            <p className="font-ui font-light text-muted leading-relaxed mb-5">{product.description}</p>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(t => (
                  <span key={t} className="font-ui text-xs text-muted2 px-2 py-1 rounded"
                    style={{ background:'rgba(26,60,46,0.05)', border:'1px solid rgba(26,60,46,0.08)' }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-6"><span className="accent-line" /></div>

            {product.stock > 0 && (
              <>
                {/* Qty selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2">Qty</span>
                  <div className="flex items-center rounded overflow-hidden"
                    style={{ border:'1.5px solid rgba(26,60,46,0.2)', background:'rgba(255,255,255,0.8)' }}>
                    <button onClick={() => setQty(Math.max(1, qty-1))}
                      className="w-10 h-10 flex items-center justify-center text-muted hover:text-forest transition-colors">
                      <FiMinus size={13} />
                    </button>
                    <span className="w-12 text-center font-ui font-semibold text-ink text-sm"
                      style={{ borderLeft:'1px solid rgba(26,60,46,0.1)', borderRight:'1px solid rgba(26,60,46,0.1)', lineHeight:'40px' }}>
                      {qty}
                    </span>
                    <button onClick={() => setQty(Math.min(product.stock, qty+1))}
                      className="w-10 h-10 flex items-center justify-center text-muted hover:text-forest transition-colors">
                      <FiPlus size={13} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart / Login prompt */}
                <div className="flex gap-3 mb-8">
                  {user ? (
                    <button onClick={handleAddToCart} className="btn-primary flex-1 justify-center py-4">
                      <FiShoppingBag size={16} /> Add to Cart
                    </button>
                  ) : (
                    <button onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded font-ui font-semibold text-[11px] tracking-[2px] uppercase transition-all"
                      style={{ background:'rgba(26,60,46,0.08)', color:'#1a3c2e', border:'1.5px solid rgba(26,60,46,0.2)' }}>
                      <FiUser size={15} /> Sign In to Add to Cart
                    </button>
                  )}
                  <button className="w-14 h-14 rounded flex items-center justify-center transition-all hover:scale-105"
                    style={{ border:'1.5px solid rgba(26,60,46,0.2)', background:'rgba(255,255,255,0.7)' }}>
                    <FiHeart size={18} className="text-muted hover:text-red-400 transition-colors" />
                  </button>
                </div>
              </>
            )}

            {/* Promises */}
            <div className="grid grid-cols-3 gap-3">
              {[['✦','Handcrafted'],['✦','Free Ship >₹999'],['✦','7-day Returns']].map(([icon, text]) => (
                <div key={text} className="text-center p-3 rounded-xl"
                  style={{ background:'rgba(26,60,46,0.04)', border:'1px solid rgba(26,60,46,0.08)' }}>
                  <span className="block text-xs mb-1" style={{ color:'#4a9470' }}>{icon}</span>
                  <span className="font-ui text-[10px] text-muted">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={id} />
      </div>
    </div>
  );
}
