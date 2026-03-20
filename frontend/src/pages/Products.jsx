import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar from '../components/FilterSidebar.jsx';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [search, setSearch]     = useState('');
  const [mobileFilter, setMobileFilter] = useState(false);

  const filters = {
    category: searchParams.get('category') || '',
    gender:   searchParams.get('gender')   || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort:     searchParams.get('sort')     || '',
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:12, ...filters };
      if (search) params.search = search;
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await productService.getAll(params);
      setProducts(data.products); setTotal(data.total); setPages(data.pages);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [searchParams, page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k));
    setSearchParams(next); setPage(1);
  };

  return (
    <div className="bg-surfaceAlt min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <div>
            <h1 className="font-sans font-bold text-4xl text-ink">Our Collections</h1>
            <p className="font-sans text-xs text-muted tracking-wider mt-1">{total} pieces found</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center bg-surfaceAlt border border-borderSoft rounded-full overflow-hidden shadow-glass px-2">
              <FiSearch size={14} className="text-muted ml-2" />
              <input type="text" placeholder="Search jewellery..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchProducts()}
                className="bg-transparent px-3 py-2.5 text-sm font-sans text-ink placeholder-stone outline-none w-44" />
              {search && <button onClick={() => setSearch('')} className="px-2 text-muted hover:text-red-400"><FiX size={13} /></button>}
            </div>
            <button onClick={() => setMobileFilter(true)}
              className="md:hidden btn-ghost py-2.5 px-4 text-xs">
              <FiFilter size={13} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-12 items-start">
          {/* Desktop sidebar */}
          <div className="hidden md:block sticky top-24">
            <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={() => { setSearchParams({}); setPage(1); }} />
          </div>

          {/* Mobile sidebar */}
          {mobileFilter && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFilter(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-surfaceAlt border-l border-borderSoft p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-sans text-[10px] tracking-[3px] uppercase text-accent/70">Filters</span>
                  <button onClick={() => setMobileFilter(false)} className="text-muted hover:text-ink"><FiX /></button>
                </div>
                <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={() => { setSearchParams({}); setPage(1); }} />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="spinner" />
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-5">🔍</div>
                <h3 className="font-sans font-bold text-2xl text-ink mb-3">No products found</h3>
                <p className="font-sans text-sm text-muted mb-6">Try adjusting your filters or search term.</p>
                <button onClick={() => setSearchParams({})} className="btn-outline">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-full font-sans text-sm border transition-all ${
                          p === page ? 'bg-brown text-white border-brown' : 'bg-surfaceAlt text-muted border-borderSoft hover:border-accent hover:text-accent'
                        }`}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
