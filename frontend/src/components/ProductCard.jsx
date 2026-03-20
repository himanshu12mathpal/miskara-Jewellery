import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiEye, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const fmt = (p) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(p);

export default function ProductCard({ product }) {
  const { addToCart }                  = useCart();
  const { user }                       = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate                       = useNavigate();
  const img       = product.images?.[0]?.url || 'https://placehold.co/400x500/edf5ef/1a3c2e?text=Miskara';
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative">
      <div className="relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
        style={{
          background:'rgba(255,255,255,0.78)',
          backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,0.92)',
          boxShadow:'0 4px 24px rgba(26,60,46,0.06), 0 1px 4px rgba(0,0,0,0.03)',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow='0 16px 48px rgba(26,60,46,0.1), 0 4px 12px rgba(0,0,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 24px rgba(26,60,46,0.06), 0 1px 4px rgba(0,0,0,0.03)'}>

        {/* Green top accent on hover */}
        <div className="absolute top-0 inset-x-0 h-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background:'linear-gradient(90deg, #1a3c2e, #4a9470, transparent)' }} />

        <div className="relative overflow-hidden" style={{ aspectRatio:'3/4' }}>
          <img src={img} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />

          {/* Wishlist heart — always visible, filled if wishlisted */}
          <button onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}
            title={wishlisted ? 'Remove from favourites' : 'Add to favourites'}>
            <FiHeart
              size={13}
              fill={wishlisted ? '#dc2626' : 'none'}
              stroke={wishlisted ? '#dc2626' : '#9ca3af'}
            />
          </button>

          {/* Category */}
          <span className="absolute top-3 left-3 font-ui font-semibold text-[9px] tracking-[2px] uppercase px-2.5 py-1.5 rounded-lg"
            style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(8px)', color:'#1a3c2e' }}>
            {product.category}
          </span>

          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background:'rgba(248,245,240,0.75)', backdropFilter:'blur(4px)' }}>
              <span className="badge-red">Sold Out</span>
            </div>
          )}

          {/* Add to cart — slides up on hover */}
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 flex gap-2">
            <button onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-ui font-semibold text-[10px] tracking-[2px] uppercase text-white transition-all"
              style={{ background:'#1a3c2e', boxShadow:'0 4px 16px rgba(26,60,46,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.background='#234d3a'}
              onMouseLeave={e => e.currentTarget.style.background='#1a3c2e'}>
              <FiShoppingBag size={11}/>
              {user ? (product.stock === 0 ? 'Out of Stock' : 'Add to Cart') : 'Sign in to Buy'}
            </button>
            <Link to={`/products/${product._id}`}
              className="w-10 flex items-center justify-center rounded-xl transition-all"
              style={{ background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
              <FiEye size={14} className="text-ink2" />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-ui font-medium text-[9px] tracking-[2.5px] uppercase text-muted2">{product.gender}</span>
            {product.stock > 0 && product.stock < 5 && (
              <span className="font-ui font-semibold text-[9px]" style={{ color:'#a8882c' }}>Only {product.stock} left</span>
            )}
          </div>
          <Link to={`/products/${product._id}`}>
            <h3 className="font-serif italic text-ink text-lg leading-snug mb-2 hover:text-forest transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <p className="font-ui font-semibold text-base" style={{ color:'#1a3c2e' }}>{fmt(product.price)}</p>
            {product.numReviews > 0 && (
              <div className="flex items-center gap-1">
                <FiStar size={11} fill="#2d6147" stroke="#2d6147" strokeWidth={1.5} />
                <span className="font-ui font-semibold text-[11px]" style={{ color:'#2d6147' }}>{product.rating}</span>
                <span className="font-ui text-[10px] text-muted2">({product.numReviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}