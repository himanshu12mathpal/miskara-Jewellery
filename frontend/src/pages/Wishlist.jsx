import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { FiHeart, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    if (product.stock === 0) return;
    addToCart(product);
  };

  if (wishlist.length === 0) return (
    <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: '#f8f5f0' }}>
      <div className="text-center px-6">
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ background: 'rgba(26,60,46,0.06)', border: '2px solid rgba(26,60,46,0.1)' }}>
          <FiHeart size={36} style={{ color: '#1a3c2e' }} />
        </div>
        <h2 className="font-serif italic text-3xl text-ink mb-3">No favourites yet</h2>
        <p className="font-ui text-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          Save pieces you love by clicking the ♥ on any product.
        </p>
        <Link to="/products" className="btn-primary">Explore Collection <FiArrowRight size={14} /></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: '#f8f5f0' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Header - Yahan se count hata diya hai */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="section-label mb-4">Your Collection</div>
            <h1 className="font-serif italic text-4xl text-ink">Favourites</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(product => {
            const img = product.images?.[0]?.url || 'https://placehold.co/400x500/edf5ef/1a3c2e?text=Miskara';
            const outOfStock = product.stock === 0;

            return (
              <div key={product._id} className="group relative">
                <div className="relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.78)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.92)',
                    boxShadow: '0 4px 24px rgba(26,60,46,0.06)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 48px rgba(26,60,46,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(26,60,46,0.06)'}>

                  {/* Green top accent on hover */}
                  <div className="absolute top-0 inset-x-0 h-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(90deg, #1a3c2e, #4a9470, transparent)' }} />

                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <img src={img} alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${outOfStock ? 'opacity-60' : ''}`}
                      loading="lazy" />

                    {/* Out of stock overlay */}
                    {outOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(248,245,240,0.7)', backdropFilter: 'blur(2px)' }}>
                        <span className="badge-red text-xs px-4 py-2">Out of Stock</span>
                      </div>
                    )}

                    {/* Category */}
                    <span className="absolute top-3 left-3 font-ui font-semibold text-[9px] tracking-[2px] uppercase px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: '#1a3c2e' }}>
                      {product.category}
                    </span>

                    {/* Remove from wishlist */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      title="Remove from favourites">
                      <FiHeart size={13} fill="#dc2626" stroke="#dc2626" />
                    </button>

                    {/* Add to cart — slides up */}
                    <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                      {outOfStock ? (
                        <div className="w-full flex items-center justify-center py-2.5 rounded-xl font-ui font-semibold text-[10px] tracking-[2px] uppercase"
                          style={{ background: 'rgba(156,163,175,0.8)', color: 'white', cursor: 'not-allowed' }}>
                          Out of Stock
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-ui font-semibold text-[10px] tracking-[2px] uppercase text-white transition-all"
                          style={{ background: '#1a3c2e', boxShadow: '0 4px 16px rgba(26,60,46,0.3)' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#234d3a'}
                          onMouseLeave={e => e.currentTarget.style.background = '#1a3c2e'}>
                          <FiShoppingBag size={11} /> Add to Cart
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 pt-3.5">
                    <span className="font-ui font-medium text-[9px] tracking-[2.5px] uppercase text-muted2 block mb-1.5">
                      {product.gender}
                    </span>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-serif italic text-ink text-lg leading-snug mb-2 hover:text-forest transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <p className="font-ui font-semibold text-base" style={{ color: outOfStock ? '#9ca3af' : '#1a3c2e' }}>
                        {fmt(product.price)}
                      </p>
                      {outOfStock ? (
                        <span className="font-ui text-[10px] text-red-400 font-medium">Unavailable</span>
                      ) : product.stock < 5 ? (
                        <span className="font-ui text-[9px] font-semibold" style={{ color: '#a8882c' }}>
                          Only {product.stock} left
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <Link to="/products" className="btn-outline">
            Continue Shopping <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}