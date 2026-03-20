import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';
import { FiArrowRight, FiStar, FiTrendingUp } from 'react-icons/fi';

const fmt = (p) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(p);

const CATS = [
  { name:'Rings',     slug:'Ring',     label:'Statement & stacking' },
  { name:'Necklaces', slug:'Necklace', label:'Chains & pendants' },
  { name:'Earrings',  slug:'Earrings', label:'Studs, hoops & dangles' },
  { name:'Bracelets', slug:'Bracelet', label:'Wrist adornments' },
];

/* ── Top seller card — tall glass card ── */
function SellerCard({ product, rank }) {
  const img = product.images?.[0]?.url || 'https://placehold.co/360x480/1a3c2e/c9a84c?text=Miskara';
  return (
    <Link to={`/products/${product._id}`} className="group block relative">
      <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
        style={{ background:'radial-gradient(ellipse, rgba(26,60,46,0.1), transparent 70%)' }} />
      <div className="relative rounded-xl overflow-hidden transition-all duration-500 group-hover:-translate-y-3"
        style={{
          background:'rgba(255,255,255,0.75)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.9)',
          boxShadow:'0 8px 32px rgba(26,60,46,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        }}>
        <div className="relative overflow-hidden" style={{ aspectRatio:'3/4' }}>
          <img src={img} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
          <div className="absolute inset-0"
            style={{ background:'linear-gradient(to top, rgba(26,60,46,0.9) 0%, rgba(26,60,46,0.1) 55%, transparent 100%)' }} />

          {/* Rank badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded"
            style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)' }}>
            <FiTrendingUp size={9} style={{ color:'#1a3c2e' }} />
            <span className="font-ui font-bold text-[9px] tracking-[2px] uppercase" style={{ color:'#1a3c2e' }}>
              #{rank} Best Seller
            </span>
          </div>



          {/* Stars if reviewed */}
          {product.numReviews > 0 && (
            <div className="absolute top-12 right-3 flex items-center gap-1 px-2.5 py-1 rounded"
              style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)' }}>
              <FiStar size={9} className="text-amber-500 fill-amber-500" />
              <span className="font-ui font-semibold text-[10px] text-ink">{product.rating}</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-ui text-[9px] tracking-[2px] uppercase font-semibold mb-1"
              style={{ color:'rgba(201,168,76,0.85)' }}>{product.category}</p>
            <h3 className="font-serif italic text-white text-xl leading-snug mb-2.5 line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-ui font-semibold text-white">{fmt(product.price)}</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded font-ui font-semibold text-[10px] tracking-wide text-white transition-all group-hover:bg-forest"
                style={{ background:'rgba(26,60,46,0.6)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.15)' }}>
                View <FiArrowRight size={10} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TrendingRow({ product }) {
  const img = product.images?.[0]?.url || 'https://placehold.co/80/f2ede6/1a3c2e?text=M';
  return (
    <Link to={`/products/${product._id}`}
      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group hover:bg-forest/5">
      <img src={img} alt={product.name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-forest/10" />
      <div className="flex-1 min-w-0">
        <p className="font-serif italic text-ink text-sm line-clamp-1 group-hover:text-forest transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="font-ui font-semibold text-xs" style={{ color:'#c9a84c' }}>{fmt(product.price)}</p>

        </div>
      </div>
      <FiArrowRight size={13} className="text-muted2 flex-shrink-0 group-hover:text-forest transition-colors" />
    </Link>
  );
}

export default function Home() {
  const [featured, setFeatured]   = useState([]);
  const [sellers, setSellers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tsLoad, setTsLoad]       = useState(true);

  useEffect(() => {
    // New arrivals
    productService.getAll({ limit:4, sort:'newest' })
      .then(({ data }) => setFeatured(data.products))
      .finally(() => setLoading(false));

    // Real top sellers from order data
    productService.getTopSellers(3)
      .then(({ data }) => setSellers(data))
      .finally(() => setTsLoad(false));
  }, []);

  return (
    <div style={{ background:'#f8f5f0' }}>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px]"
            style={{ background:'radial-gradient(circle at 80% 20%, rgba(26,60,46,0.06) 0%, transparent 65%)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px]"
            style={{ background:'radial-gradient(circle at 20% 80%, rgba(201,168,76,0.05) 0%, transparent 65%)' }} />
          <div className="absolute inset-0 opacity-[0.25]"
            style={{ backgroundImage:'linear-gradient(rgba(26,60,46,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(26,60,46,0.15) 1px, transparent 1px)', backgroundSize:'80px 80px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded mb-8"
                style={{ background:'rgba(26,60,46,0.07)', border:'1px solid rgba(26,60,46,0.12)' }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#1a3c2e' }} />
                <span className="font-ui font-semibold text-[10px] tracking-[3px] uppercase" style={{ color:'#1a3c2e' }}>
                  New Collection 2026
                </span>
              </div>

              <h1 className="font-serif mb-6 leading-none" style={{ fontSize:'clamp(3.5rem,6.5vw,6rem)', fontStyle:'italic', fontWeight:400 }}>
                <span className="text-ink block">Jewellery that</span>
                <span className="block" style={{ color:'#1a3c2e' }}>speaks for itself</span>
              </h1>

              <p className="font-ui font-light text-muted text-lg leading-relaxed max-w-md mb-10">
                Each Miskara piece is a wearable work of art — handcrafted for those who carry their stories close.
              </p>

              <div className="flex flex-wrap gap-4 mb-16">
                <Link to="/products" className="btn-primary">Explore Collection <FiArrowRight size={14}/></Link>
                <Link to="/feedback" className="btn-ghost">Get in Touch</Link>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {[['200+','Unique Pieces'],['1200+','Happy Clients'],['100%','Handmade']].map(([n, l]) => (
                  <div key={l} className="px-5 py-3.5 rounded-lg"
                    style={{ background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)', border:'1px solid rgba(26,60,46,0.08)', boxShadow:'0 4px 20px rgba(26,60,46,0.04)' }}>
                    <p className="font-serif italic text-2xl text-ink leading-none">{n}</p>
                    <p className="font-ui text-[10px] text-muted font-medium tracking-wider uppercase mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute w-[420px] h-[420px] rounded-full" style={{ border:'1px solid rgba(26,60,46,0.08)' }} />
              <div className="absolute w-[340px] h-[340px] rounded-full animate-spin-slow" style={{ border:'1px dashed rgba(201,168,76,0.2)' }} />
              <div className="absolute w-[260px] h-[260px] rounded-full" style={{ border:'1px solid rgba(26,60,46,0.06)' }} />
              <div className="absolute w-64 h-64 rounded-full animate-glow"
                style={{ background:'radial-gradient(circle, rgba(26,60,46,0.12), transparent 70%)' }} />
              <img src="/logo.png" alt="Miskara"
                className="relative z-10 rounded-full object-cover animate-float"
                style={{ width:'220px', height:'220px', border:'3px solid rgba(255,255,255,0.95)', boxShadow:'0 20px 60px rgba(26,60,46,0.2)' }} />

              <div className="absolute -top-4 -left-8 px-4 py-3 rounded-xl animate-float-slow"
                style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 8px 32px rgba(26,60,46,0.08)', animationDelay:'1.5s' }}>
                <p className="font-serif italic text-ink text-sm">New Arrivals</p>
                <p className="font-ui text-[10px] text-muted mt-0.5">Just dropped ✦</p>
              </div>

              <div className="absolute -bottom-4 -right-8 px-4 py-3 rounded-xl animate-float-slow"
                style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 8px 32px rgba(26,60,46,0.08)', animationDelay:'3s' }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {['P','S','A'].map((l,i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ background:'#1a3c2e' }}>{l}</div>
                    ))}
                  </div>
                  <div>
                    <p className="font-ui font-bold text-xs text-ink">1200+ Happy</p>
                    <p className="font-ui text-[10px] text-muted">★ 4.9 rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="overflow-hidden py-5 border-y" style={{ borderColor:'rgba(26,60,46,0.08)', background:'rgba(255,255,255,0.5)', backdropFilter:'blur(8px)' }}>
        <div className="flex gap-16 whitespace-nowrap marquee-inner">
          {[...Array(10)].map((_,i) => (
            <span key={i} className="flex items-center gap-4 font-serif italic text-lg" style={{ color:'rgba(26,60,46,0.4)' }}>
              <span style={{ color:'#c9a84c', fontSize:'10px' }}>◆</span> Miskara Jewellery
              <span style={{ color:'#c9a84c', fontSize:'10px' }}>◆</span> Handcrafted with Love
            </span>
          ))}
        </div>
      </div>

      {/* ══ TOP SELLERS — REAL SALES DATA ══ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:'radial-gradient(ellipse at 60% 40%, rgba(26,60,46,0.04), transparent 60%)' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="section-label mb-5">Based on Real Sales</div>
              <h2 className="font-serif italic text-ink" style={{ fontSize:'clamp(2.5rem,4vw,3.8rem)', fontWeight:400 }}>
                Top Sellers
              </h2>
              <p className="font-ui font-light text-muted mt-3 max-w-sm leading-relaxed">
                Our most-purchased pieces — ranked by actual customer orders.
              </p>
            </div>
            <Link to="/products" className="btn-outline self-start whitespace-nowrap">View All <FiArrowRight /></Link>
          </div>

          {tsLoad ? <div className="spinner" /> : sellers.length === 0 ? (
            <div className="text-center py-16 rounded-2xl"
              style={{ background:'rgba(255,255,255,0.5)', border:'1px dashed rgba(26,60,46,0.15)' }}>
              <p className="font-serif italic text-xl text-ink mb-2">No sales data yet</p>
              <p className="font-ui text-sm text-muted">Top sellers will appear here once orders are placed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {sellers.slice(0, 3).map((p, i) => (
                <SellerCard key={p._id} product={p} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ CATEGORIES ══ */}
      <section className="py-24 border-y" style={{ borderColor:'rgba(26,60,46,0.07)', background:'rgba(255,255,255,0.4)', backdropFilter:'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-5">Browse by Type</div>
            <h2 className="font-serif italic text-ink" style={{ fontSize:'clamp(2.5rem,4vw,3.5rem)', fontWeight:400 }}>Our Collections</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {CATS.map((cat, i) => (
              <Link key={cat.name} to={`/products?category=${cat.slug}`}
                className="group relative rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(26,60,46,0.04)',
                  backdropFilter:'blur(16px)',
                  border:'1px solid rgba(255,255,255,0.85)',
                  boxShadow:'0 4px 20px rgba(26,60,46,0.05)',
                  aspectRatio:'1',
                }}>
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                    style={{ background:'rgba(26,60,46,0.06)', border:'1px solid rgba(26,60,46,0.1)' }}>
                    <img src="/logo.png" alt="" className="w-10 h-10 rounded-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-400" />
                  </div>
                  <h3 className="font-serif italic text-ink text-lg mb-1">{cat.name}</h3>
                  <p className="font-ui text-muted text-xs">{cat.label}</p>
                  <div className="absolute bottom-4 right-4 w-7 h-7 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{ background:'#1a3c2e' }}>
                    <FiArrowRight size={12} className="text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NEW ARRIVALS ══ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-label justify-center mb-5">Just Arrived</div>
            <h2 className="font-serif italic text-ink" style={{ fontSize:'clamp(2.5rem,4vw,3.5rem)', fontWeight:400 }}>New Arrivals</h2>
            <div className="flex items-center justify-center gap-6 mt-5">
              <div className="h-px w-20" style={{ background:'linear-gradient(to right, transparent, rgba(26,60,46,0.2))' }} />
              <span style={{ color:'#c9a84c', fontSize:'12px' }}>◆</span>
              <div className="h-px w-20" style={{ background:'linear-gradient(to left, transparent, rgba(26,60,46,0.2))' }} />
            </div>
          </div>
          {loading ? <div className="spinner" /> : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="text-center mt-14">
                <Link to="/products" className="btn-outline">View All Pieces <FiArrowRight /></Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ PROMISES ══ */}
      <section className="py-14 border-y" style={{ borderColor:'rgba(26,60,46,0.08)', background:'rgba(255,255,255,0.5)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ['✦','Free Shipping','Orders above ₹999'],
            ['✦','Exclusive Design','100% handcrafted'],
            ['✦','Gift Packaging','Premium unboxing'],
            ['✦','Secure Payments','Razorpay protected'],
          ].map(([icon,title,text]) => (
            <div key={title} className="p-5 rounded-lg transition-all hover:shadow-card"
              style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(8px)' }}>
              <div className="text-sm mb-3" style={{ color:'#c9a84c' }}>{icon}</div>
              <h4 className="font-ui font-semibold text-ink text-sm mb-1 tracking-wider uppercase text-[11px]">{title}</h4>
              <p className="font-ui font-light text-muted text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}