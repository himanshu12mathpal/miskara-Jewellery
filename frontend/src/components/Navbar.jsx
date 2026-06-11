import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { FiShoppingBag, FiMenu, FiX, FiLogOut, FiPackage, FiSettings, FiChevronDown, FiHeart } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAdmin }      = useAuth();
  const { totalItems }                 = useCart();
  const { totalWishlist }              = useWishlist();
  const navigate                       = useNavigate();
  const [open, setOpen]                = useState(false);
  const [scrolled, setScrolled]        = useState(false);
  const [drop, setDrop]                = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const doLogout = () => { logout(); navigate('/'); setDrop(false); };

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}
        style={{
          background:    scrolled ? 'rgba(248,245,240,0.94)' : 'rgba(248,245,240,0.7)',
          backdropFilter:'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          borderBottom:  scrolled ? '1px solid rgba(26,60,46,0.1)' : '1px solid transparent',
          boxShadow:     scrolled ? '0 4px 30px rgba(26,60,46,0.06)' : 'none',
        }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm scale-110"
                style={{ background:'rgba(26,60,46,0.2)' }} />
              <img src="/logo.png" alt="Miskara"
                className="relative w-10 h-10 rounded-full object-cover border-2 border-white shadow-card transition-all duration-300" />
            </div>
            <div className="leading-none">
              <span className="font-serif font-medium text-2xl text-ink block italic" style={{ letterSpacing:'0.02em' }}>Miskara</span>
              <span className="font-ui text-[7px] tracking-[4px] uppercase font-semibold block mt-0.5" style={{ color:'#1a3c2e' }}>Jewellery</span>
            </div>
          </Link>

          {/* Nav links */}
          <ul className="hidden md:flex items-center gap-1 list-none">
            {[['/', 'Home'], ['/products', 'Collections'], ['/feedback', 'Contact']].map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'}
                  className={({ isActive }) =>
                    `font-ui font-medium text-[11px] tracking-[2px] uppercase px-4 py-2 rounded transition-all duration-200 ${
                      isActive ? 'text-forest bg-forest/8' : 'text-muted hover:text-ink hover:bg-forest/5'
                    }`
                  }>{label}</NavLink>
              </li>
            ))}
            {isAdmin && (
              <li>
                <NavLink to="/admin"
                  className={({ isActive }) =>
                    `font-ui font-medium text-[11px] tracking-[2px] uppercase px-4 py-2 rounded transition-all duration-200 ${isActive ? 'text-forest bg-forest/8' : 'text-muted hover:text-ink hover:bg-forest/5'}`
                  }>Dashboard</NavLink>
              </li>
            )}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Wishlist heart (Count Hata Diya Yahan Se) */}
            <Link to="/wishlist" className="relative group">
              <div className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 hover:bg-red-50">
                <FiHeart size={18}
                  fill={totalWishlist > 0 ? '#dc2626' : 'none'}
                  stroke={totalWishlist > 0 ? '#dc2626' : '#4a4a3a'}
                  className="transition-colors" />
              </div>
            </Link>

            {/* Cart (Iska count rakha hai, agar iska bhi hatana ho toh bata diyo) */}
            <Link to="/cart" className="relative group">
              <div className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 hover:bg-forest/8">
                <FiShoppingBag size={18} className="text-ink2 group-hover:text-forest transition-colors" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-ui font-bold text-white"
                  style={{ background:'#1a3c2e' }}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            {user ? (
              <div className="hidden md:block relative">
                <button onClick={() => setDrop(!drop)}
                  className="flex items-center gap-2 px-4 py-2 rounded border font-ui font-medium text-[11px] text-ink2 transition-all hover:border-forest/30 hover:bg-forest/5"
                  style={{ borderColor:'rgba(26,60,46,0.15)', background:'rgba(255,255,255,0.6)', backdropFilter:'blur(8px)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ background:'#1a3c2e' }}>
                    {user.name[0]}
                  </div>
                  {user.name.split(' ')[0]}
                  <FiChevronDown size={11} className={`text-muted transition-transform ${drop ? 'rotate-180' : ''}`} />
                </button>

                {drop && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-premium border animate-fade-in"
                    style={{ background:'rgba(255,255,255,0.97)', backdropFilter:'blur(20px)', borderColor:'rgba(26,60,46,0.1)' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor:'rgba(26,60,46,0.08)' }}>
                      <p className="font-ui text-[10px] text-muted tracking-wider uppercase">Signed in as</p>
                      <p className="font-ui text-sm text-ink font-semibold truncate mt-0.5">{user.email}</p>
                    </div>
                    {[
                      ['/orders',   'My Orders',    FiPackage],
                      ['/wishlist', 'Favourites',   FiHeart],
                      ...(isAdmin ? [['/admin', 'Admin Panel', FiSettings]] : []),
                    ].map(([to, label, Icon]) => (
                      <Link key={to} to={to} onClick={() => setDrop(false)}
                        className="flex items-center gap-3 px-4 py-3 font-ui text-[11px] tracking-wider text-muted hover:text-forest hover:bg-forest/5 transition-all">
                        <Icon size={13} /> {label}
                        {/* Dropdown menu ke andar se bhi count hata diya hai */}
                      </Link>
                    ))}
                    <button onClick={doLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 font-ui text-[11px] tracking-wider text-muted hover:text-red-600 hover:bg-red-50 transition-all border-t"
                      style={{ borderColor:'rgba(26,60,46,0.08)' }}>
                      <FiLogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex btn-outline py-2.5 px-6 text-[10px]">Sign In</Link>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden w-10 h-10 rounded border flex items-center justify-center text-ink2 hover:bg-forest/8 transition-all"
              style={{ borderColor:'rgba(26,60,46,0.12)' }}
              onClick={() => setOpen(!open)}>
              {open ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40"
          style={{ background:'rgba(248,245,240,0.98)', backdropFilter:'blur(24px)' }}>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {[
              ['/', 'Home'], 
              ['/products', 'Collections'], 
              ...(user ? [['/orders', 'My Orders']] : []),
              ['/wishlist', 'Favourites'], 
              ['/feedback', 'Contact']
            ].map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                className="font-serif italic text-4xl text-ink hover:text-forest transition-colors">
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)}
                className="font-serif italic text-4xl text-ink hover:text-forest transition-colors">
                Dashboard
              </NavLink>
            )}
            <div className="flex gap-3 mt-4">
              {user
                ? <button onClick={doLogout} className="btn-outline">Sign Out</button>
                : <Link to="/login" onClick={() => setOpen(false)} className="btn-primary">Sign In</Link>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}
