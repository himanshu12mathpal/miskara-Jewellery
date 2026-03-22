import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const CATS  = ['Necklace','Earrings','Bracelet','Ring','Anklet','Pendant','Set'];
const GENS  = ['Women','Men','Unisex'];
const SORTS = [
  { value:'newest',     label:'Newest First' },
  { value:'price-asc',  label:'Price: Low → High' },
  { value:'price-desc', label:'Price: High → Low' },
];

const Radio = ({ name, options, current, onSelect }) => (
  <div className="space-y-2.5">
    {options.map(opt => {
      const val = typeof opt === 'string' ? opt : opt.value;
      const lbl = typeof opt === 'string' ? opt : opt.label;
      const on  = current === val;
      return (
        <label key={val} className="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name={name} value={val} checked={on}
            onChange={() => onSelect(on ? '' : val)} className="hidden" />
          <span className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all"
            style={{
              borderColor:    on ? '#1a3c2e' : 'rgba(26,60,46,0.2)',
              background:     on ? '#1a3c2e' : 'transparent',
              boxShadow:      on ? 'inset 0 0 0 2.5px #f8f5f0' : 'none',
            }}/>
          <span className="font-ui text-sm transition-colors"
            style={{ color: on ? '#1a3c2e' : '#7a7060', fontWeight: on ? 600 : 400 }}>
            {lbl}
          </span>
        </label>
      );
    })}
  </div>
);

export default function FilterSidebar({ filters, onChange, onClear }) {
  const [min, setMin] = useState(filters.minPrice || '');
  const [max, setMax] = useState(filters.maxPrice || '');

  // Sync price inputs when filters cleared externally
  useEffect(() => {
    setMin(filters.minPrice || '');
    setMax(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const has = filters.category || filters.gender || filters.minPrice || filters.maxPrice || filters.sort;

  const handleChange = (updates) => {
    onChange(updates);
    // Scroll to top of products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom:'1px solid rgba(26,60,46,0.1)' }}>
        <span className="font-ui font-semibold text-[10px] tracking-[3px] uppercase" style={{ color:'#1a3c2e' }}>
          Filters
        </span>
        {has && (
          <button onClick={() => { onClear(); setMin(''); setMax(''); }}
            className="flex items-center gap-1 font-ui text-[10px] text-muted hover:text-red-400 transition-colors"
            style={{ background:'none', border:'none' }}>
            <FiX size={11}/> Clear
          </button>
        )}
      </div>

      {[
        { title:'Sort By',  name:'sort', opts:SORTS, cur:filters.sort,     fn:(v) => handleChange({ sort:v }) },
        { title:'Category', name:'cat',  opts:CATS,  cur:filters.category, fn:(v) => handleChange({ category:v }) },
        { title:'For',      name:'gen',  opts:GENS,  cur:filters.gender,   fn:(v) => handleChange({ gender:v }) },
      ].map(({ title, name, opts, cur, fn }) => (
        <div key={name} className="mb-6 pb-6" style={{ borderBottom:'1px solid rgba(26,60,46,0.07)' }}>
          <h4 className="font-ui font-semibold text-[9px] tracking-[2.5px] uppercase mb-3.5" style={{ color:'#7a7060' }}>
            {title}
          </h4>
          <Radio name={name} options={opts} current={cur} onSelect={fn} />
        </div>
      ))}

      <div>
        <h4 className="font-ui font-semibold text-[9px] tracking-[2.5px] uppercase mb-3.5" style={{ color:'#7a7060' }}>
          Price (₹)
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <input type="number" placeholder="Min" value={min}
            onChange={e => setMin(e.target.value)}
            className="input-field text-xs py-2 px-3" />
          <span className="font-ui text-xs text-muted">—</span>
          <input type="number" placeholder="Max" value={max}
            onChange={e => setMax(e.target.value)}
            className="input-field text-xs py-2 px-3" />
        </div>
        <button
          onClick={() => handleChange({ minPrice:min, maxPrice:max })}
          className="btn-outline w-full justify-center py-2 text-[10px]">
          Apply
        </button>
      </div>
    </aside>
  );
}
