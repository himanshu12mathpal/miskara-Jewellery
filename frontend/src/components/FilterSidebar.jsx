import { useState } from 'react';
import { FiX } from 'react-icons/fi';

const CATS  = ['Necklace','Earrings','Bracelet','Ring','Anklet','Pendant','Set'];
const GENS  = ['Women','Men','Unisex'];
const SORTS = [{value:'newest',label:'Newest First'},{value:'price-asc',label:'Price: Low → High'},{value:'price-desc',label:'Price: High → Low'}];

const Radio = ({ name, options, current, onSelect }) => (
  <div className="space-y-2.5">
    {options.map(opt => {
      const val = typeof opt==='string'?opt:opt.value;
      const lbl = typeof opt==='string'?opt:opt.label;
      const on  = current===val;
      return (
        <label key={val} className="flex items-center gap-3 cursor-pointer group">
          <input type="radio" name={name} value={val} checked={on} onChange={() => onSelect(on?'':val)} className="hidden"/>
          <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${on?'border-violet':'border-violet/25 group-hover:border-violet/50'}`}
            style={on?{background:'linear-gradient(135deg,#7c5cfc,#f472b6)',boxShadow:'inset 0 0 0 2.5px #f0f4ff'}:{}}/>
          <span className={`font-sans text-sm transition-colors ${on?'text-violet font-600':'text-slate group-hover:text-ink'}`}>{lbl}</span>
        </label>
      );
    })}
  </div>
);

export default function FilterSidebar({ filters, onChange, onClear }) {
  const [min,setMin] = useState(filters.minPrice||'');
  const [max,setMax] = useState(filters.maxPrice||'');
  const has = filters.category||filters.gender||filters.minPrice||filters.maxPrice||filters.sort;
  return (
    <aside className="w-56 flex-shrink-0">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-violet/10">
        <span className="font-sans font-700 text-[10px] tracking-[3px] uppercase text-violet">Filters</span>
        {has && <button onClick={onClear} className="flex items-center gap-1 text-[10px] font-sans font-600 text-slate2 hover:text-red-400 transition-colors"><FiX size={11}/> Clear</button>}
      </div>
      {[
        { title:'Sort By', name:'sort', opts:SORTS,    cur:filters.sort,     fn:(v)=>onChange({sort:v}) },
        { title:'Category',name:'cat',  opts:CATS,     cur:filters.category, fn:(v)=>onChange({category:v}) },
        { title:'For',     name:'gen',  opts:GENS,     cur:filters.gender,   fn:(v)=>onChange({gender:v}) },
      ].map(({ title,name,opts,cur,fn }) => (
        <div key={name} className="mb-6 pb-6 border-b border-violet/8">
          <h4 className="font-sans font-600 text-[9px] tracking-[2.5px] uppercase text-slate mb-3.5">{title}</h4>
          <Radio name={name} options={opts} current={cur} onSelect={fn}/>
        </div>
      ))}
      <div>
        <h4 className="font-sans font-600 text-[9px] tracking-[2.5px] uppercase text-slate mb-3.5">Price (₹)</h4>
        <div className="flex items-center gap-2 mb-3">
          <input type="number" placeholder="Min" value={min} onChange={e=>setMin(e.target.value)} className="input-field text-xs py-2 px-3"/>
          <span className="text-slate2 text-xs">—</span>
          <input type="number" placeholder="Max" value={max} onChange={e=>setMax(e.target.value)} className="input-field text-xs py-2 px-3"/>
        </div>
        <button onClick={()=>onChange({minPrice:min,maxPrice:max})} className="btn-outline w-full justify-center py-2 text-[10px]">Apply</button>
      </div>
    </aside>
  );
}
