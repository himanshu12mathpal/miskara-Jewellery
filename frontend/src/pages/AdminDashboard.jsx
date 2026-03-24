import { useEffect, useState, useCallback } from 'react';

import { productService } from '../services/productService.js';

import { orderService } from '../services/orderService.js';

import { categoryService } from '../services/categoryService.js';

import api from '../services/api.js';

import toast from 'react-hot-toast';

import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX, FiRefreshCw, FiPackage, FiMessageSquare, FiBox, FiTag } from 'react-icons/fi';



const fmt     = (p) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(p);

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });



// ── Status badge class map ──

const statusBadge = (s) => {

  const map = { Pending:'badge-amber', Accepted:'badge-green', Rejected:'badge-red', Shipped:'badge-blue', Delivered:'badge-green' };

  return map[s] || 'badge-accent';

};



const GENS = ['Women','Men','Unisex'];

const TABS = [

  { id:'products',   label:'Products',   icon:<FiBox size={14}/> },

  { id:'categories', label:'Categories', icon:<FiTag size={14}/> },

  { id:'orders',     label:'Orders',     icon:<FiPackage size={14}/> },

  { id:'feedback',   label:'Feedback',   icon:<FiMessageSquare size={14}/> },

];



const Lbl = ({ c }) => (

  <label className="block font-ui text-[9px] tracking-[2px] uppercase text-muted mb-1.5">{c}</label>

);



export default function AdminDashboard() {

  const [tab, setTab]             = useState('products');



  // products

  const [products, setProducts]   = useState([]);

  const [prodLoad, setProdLoad]   = useState(true);

  const [showForm, setShowForm]   = useState(false);

  const [editProd, setEditProd]   = useState(null);

  const [saving, setSaving]       = useState(false);

  const [prodForm, setProdForm]   = useState({ name:'', description:'', price:'', category:'Necklace', gender:'Women', stock:'', material:'', tags:'' });

  const [files, setFiles]         = useState([]);



  // orders

  const [orders, setOrders]       = useState([]);

  const [ordLoad, setOrdLoad]     = useState(false);

  const [statusF, setStatusF]     = useState('');   // '' = All

  const [reasons, setReasons]     = useState({});



  // feedback

  const [feedbacks, setFeedbacks] = useState([]);

  const [fbLoad, setFbLoad]       = useState(true);



  // categories

  const [categories, setCategories] = useState([]);

  const [catName, setCatName]       = useState('');

  const [catLoad, setCatLoad]       = useState(false);

  const [catSaving, setCatSaving]   = useState(false);



  // ── Fix: pass filter directly to avoid stale closure ──

  const loadOrders = useCallback(async (filterStatus) => {

    setOrdLoad(true);

    try {

      // Use passed filterStatus, NOT statusF from closure

      const params = { limit: 100 };

      if (filterStatus !== undefined && filterStatus !== '') {

        params.status = filterStatus;

      }

      const { data } = await orderService.getAll(params);

      setOrders(data.orders || []);

    } catch (err) {

      console.error('Load orders error:', err);

      toast.error('Failed to load orders');

      setOrders([]);

    } finally {

      setOrdLoad(false);

    }

  }, []);



  const loadProducts = async () => {

    setProdLoad(true);

    try {

      const { data } = await productService.getAll({ limit: 100 });

      setProducts(data.products || []);

    } catch { toast.error('Failed to load products'); }

    finally { setProdLoad(false); }

  };



  const loadFeedback = async () => {

    setFbLoad(true);

    try {

      const { data } = await api.get('/feedback');

      setFeedbacks(data || []);

    } catch { toast.error('Failed to load feedback'); }

    finally { setFbLoad(false); }

  };



  const loadCategories = async () => {

    setCatLoad(true);

    try {

      const { data } = await categoryService.getAll();

      setCategories(data || []);

      // Set default category for product form if available

      if (data && data.length > 0 && !prodForm.category) {

        setProdForm(prev => ({ ...prev, category: data[0].name }));

      }

    } catch { toast.error('Failed to load categories'); }

    finally { setCatLoad(false); }

  };



  // Load data when tab changes or initially

  useEffect(() => {

    if (categories.length === 0) loadCategories(); // Always load for products form

    if (tab === 'products' && products.length === 0) loadProducts();

    if (tab === 'orders')   loadOrders(statusF);

    if (tab === 'feedback') loadFeedback();

    if (tab === 'categories' && categories.length === 0) loadCategories();

  }, [tab]);



  // ── Filter button click — pass new status directly ──

  const handleFilterChange = (newStatus) => {

    setStatusF(newStatus);

    loadOrders(newStatus); // pass directly, don't rely on state

  };



  // products CRUD

  const openAdd = () => {

    setEditProd(null);

    setProdForm({ name:'', description:'', price:'', category:'Necklace', gender:'Women', stock:'', material:'', tags:'' });

    setFiles([]);

    setShowForm(true);

  };

  const openEdit = (p) => {

    setEditProd(p);

    setProdForm({ name:p.name, description:p.description, price:p.price, category:p.category, gender:p.gender, stock:p.stock, material:p.material||'', tags:p.tags?.join(', ')||'' });

    setFiles([]);

    setShowForm(true);

  };

  const handleProdSubmit = async (e) => {

    e.preventDefault(); setSaving(true);

    try {

      const fd = new FormData();

      Object.entries(prodForm).forEach(([k, v]) => fd.append(k, v));

      files.forEach(f => fd.append('images', f));

      if (editProd) { await productService.update(editProd._id, fd); toast.success('Product updated'); }

      else          { await productService.create(fd); toast.success('Product added'); }

      setShowForm(false);

      loadProducts();

    } catch { toast.error('Failed to save'); }

    finally { setSaving(false); }

  };

  const deleteProd = async (id) => {

    if (!confirm('Delete this product?')) return;

    try {

      await productService.delete(id);

      toast.success('Deleted');

      setProducts(p => p.filter(x => x._id !== id));

    } catch { toast.error('Failed to delete'); }

  };



  // order actions

  const updateOrder = async (id, status) => {

    try {

      await orderService.updateStatus(id, { status, rejectionReason: reasons[id] || '' });

      toast.success(`Order marked as ${status}`);

      loadOrders(statusF); // reload with current filter

    } catch { toast.error('Failed to update order'); }

  };



  const markRead = async (id) => {

    try {

      await api.put(`/feedback/${id}/read`);

      setFeedbacks(f => f.map(x => x._id === id ? { ...x, isRead: true } : x));

    } catch { toast.error('Failed'); }

  };



  // categories CRUD

  const handleCatSubmit = async (e) => {

    e.preventDefault();

    if (!catName.trim()) return;

    setCatSaving(true);

    try {

      await categoryService.create(catName);

      toast.success('Category added');

      setCatName('');

      loadCategories();

    } catch (err) {

      toast.error(err.response?.data?.message || 'Failed to add category');

    } finally {

      setCatSaving(false);

    }

  };



  const deleteCat = async (id) => {

    if (!confirm('Delete this category? Products using this category will not be deleted, but may cause filter issues.')) return;

    try {

      await categoryService.delete(id);

      toast.success('Category deleted');

      setCategories(c => c.filter(x => x._id !== id));

    } catch { toast.error('Failed to delete category'); }

  };



  return (

    <div style={{ background:'#f8f5f0', minHeight:'100vh', paddingTop:'96px', paddingBottom:'80px' }}>

      <div className="max-w-7xl mx-auto px-6">



        <div className="mb-8">

          <h1 className="font-serif italic text-4xl text-ink">Admin Dashboard</h1>

          <p className="font-ui text-xs tracking-[2px] uppercase text-muted mt-1">Manage your store</p>

        </div>



        {/* Tabs */}

        <div className="flex gap-1 mb-10" style={{ borderBottom:'1px solid rgba(26,60,46,0.1)' }}>

          {TABS.map(t => (

            <button key={t.id} onClick={() => setTab(t.id)}

              className="flex items-center gap-2 px-6 py-3.5 font-ui text-[11px] tracking-[1.5px] uppercase transition-all border-b-2 -mb-px"

              style={{

                color:        tab === t.id ? '#1a3c2e' : '#7a7060',

                borderColor:  tab === t.id ? '#1a3c2e' : 'transparent',

                fontWeight:   tab === t.id ? 600 : 400,

              }}>

              {t.icon} {t.label}

            </button>

          ))}

        </div>



        {/* ════════════ PRODUCTS ════════════ */}

        {tab === 'products' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-ui text-ink font-semibold">Products ({products.length})</h2>

              <button onClick={openAdd} className="btn-primary py-2.5 px-5 text-xs">

                <FiPlus size={13}/> Add Product

              </button>

            </div>



            {/* Add/Edit Modal */}

            {showForm && (

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"

                style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }}>

                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"

                  style={{ background:'rgba(255,255,255,0.95)', border:'1px solid rgba(26,60,46,0.1)', boxShadow:'0 20px 60px rgba(26,60,46,0.15)' }}>

                  <div className="flex items-center justify-between p-6" style={{ borderBottom:'1px solid rgba(26,60,46,0.08)' }}>

                    <h3 className="font-serif italic text-xl text-ink">{editProd ? 'Edit Product' : 'Add New Product'}</h3>

                    <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink transition-all"

                      style={{ border:'1px solid rgba(26,60,46,0.1)' }}>

                      <FiX size={15}/>

                    </button>

                  </div>

                  <form onSubmit={handleProdSubmit} className="p-6 space-y-4">

                    <div className="grid grid-cols-2 gap-4">

                      <div><Lbl c="Name"/><input className="input-field" value={prodForm.name} onChange={e=>setProdForm({...prodForm,name:e.target.value})} required/></div>

                      <div><Lbl c="Price (₹)"/><input className="input-field" type="number" value={prodForm.price} onChange={e=>setProdForm({...prodForm,price:e.target.value})} required/></div>

                    </div>

                    <div><Lbl c="Description"/><textarea className="input-field resize-none" rows={3} value={prodForm.description} onChange={e=>setProdForm({...prodForm,description:e.target.value})} required/></div>

                    <div className="grid grid-cols-3 gap-4">

                      <div>

                        <Lbl c="Category"/>

                        <select className="input-field" value={prodForm.category} onChange={e=>setProdForm({...prodForm,category:e.target.value})} required>

                          <option value="" disabled>Select Category</option>

                          {categories.map(c=><option key={c._id} value={c.name}>{c.name}</option>)}

                        </select>

                      </div>

                      <div><Lbl c="Gender"/><select className="input-field" value={prodForm.gender} onChange={e=>setProdForm({...prodForm,gender:e.target.value})}>{GENS.map(g=><option key={g}>{g}</option>)}</select></div>

                      <div><Lbl c="Stock"/><input className="input-field" type="number" value={prodForm.stock} onChange={e=>setProdForm({...prodForm,stock:e.target.value})}/></div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div><Lbl c="Material"/><input className="input-field" placeholder="e.g. Sterling Silver" value={prodForm.material} onChange={e=>setProdForm({...prodForm,material:e.target.value})}/></div>

                      <div><Lbl c="Tags (comma sep.)"/><input className="input-field" placeholder="silver, minimal" value={prodForm.tags} onChange={e=>setProdForm({...prodForm,tags:e.target.value})}/></div>

                    </div>

                    <div>

                      <Lbl c="Images"/>

                      <input type="file" multiple accept="image/*" className="input-field text-xs py-2" onChange={e=>setFiles(Array.from(e.target.files))}/>

                      {files.length > 0 && <p className="font-ui text-xs mt-1" style={{color:'#1a3c2e'}}>{files.length} file(s) selected</p>}

                    </div>

                    <div className="flex justify-end gap-3 pt-2">

                      <button type="button" onClick={()=>setShowForm(false)} className="btn-ghost py-2.5 px-5 text-xs">Cancel</button>

                      <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6 text-xs">

                        {saving ? 'Saving...' : editProd ? 'Update' : 'Add Product'}

                      </button>

                    </div>

                  </form>

                </div>

              </div>

            )}



            {prodLoad ? <div className="spinner"/> : (

              <div className="rounded-2xl overflow-hidden"

                style={{ background:'rgba(255,255,255,0.78)', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 24px rgba(26,60,46,0.06)' }}>

                <table className="w-full text-sm">

                  <thead>

                    <tr style={{ background:'rgba(26,60,46,0.04)', borderBottom:'1px solid rgba(26,60,46,0.08)' }}>

                      {['Image','Name','Category','Price','Stock','Actions'].map(h => (

                        <th key={h} className="text-left py-3 px-5 font-ui text-[9px] tracking-[2px] uppercase text-muted font-semibold">{h}</th>

                      ))}

                    </tr>

                  </thead>

                  <tbody>

                    {products.map(p => (

                      <tr key={p._id} className="transition-colors" style={{ borderTop:'1px solid rgba(26,60,46,0.05)' }}

                        onMouseEnter={e=>e.currentTarget.style.background='rgba(26,60,46,0.02)'}

                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                        <td className="py-3 px-5">

                          <img src={p.images?.[0]?.url||''} alt={p.name} className="w-12 h-12 object-cover rounded-xl"

                            style={{ border:'1px solid rgba(26,60,46,0.1)' }}/>

                        </td>

                        <td className="py-3 px-5">

                          <p className="font-ui text-ink text-sm font-medium">{p.name}</p>

                          <p className="font-ui text-[10px] text-muted uppercase tracking-wider mt-0.5">{p.gender}</p>

                        </td>

                        <td className="py-3 px-5"><span className="badge-accent">{p.category}</span></td>

                        <td className="py-3 px-5 font-ui font-semibold" style={{color:'#1a3c2e'}}>{fmt(p.price)}</td>

                        <td className={`py-3 px-5 font-ui text-sm font-medium ${p.stock < 5 ? 'text-amber-600' : 'text-ink'}`}>{p.stock}</td>

                        <td className="py-3 px-5">

                          <div className="flex gap-2">

                            <button onClick={()=>openEdit(p)}

                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-forest transition-all"

                              style={{border:'1px solid rgba(26,60,46,0.12)'}}>

                              <FiEdit size={13}/>

                            </button>

                            <button onClick={()=>deleteProd(p._id)}

                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-500 transition-all"

                              style={{border:'1px solid rgba(26,60,46,0.12)'}}>

                              <FiTrash2 size={13}/>

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

                {products.length === 0 && (

                  <p className="text-center font-ui text-muted text-sm py-16">No products yet. Add your first one!</p>

                )}

              </div>

            )}

          </div>

        )}



        {/* ════════════ CATEGORIES ════════════ */}

        {tab === 'categories' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-ui text-ink font-semibold">Categories ({categories.length})</h2>

            </div>

            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

              

              {/* Add category form */}

              <div className="md:col-span-1 p-6 rounded-2xl" style={{ background:'rgba(255,255,255,0.78)', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 24px rgba(26,60,46,0.06)' }}>

                <h3 className="font-serif italic text-lg text-ink mb-4">Add Category</h3>

                <form onSubmit={handleCatSubmit} className="space-y-4">

                  <div>

                    <Lbl c="Category Name" />

                    <input className="input-field" placeholder="e.g. Necklace" value={catName} onChange={e => setCatName(e.target.value)} required />

                  </div>

                  <button type="submit" disabled={catSaving || !catName.trim()} className="btn-primary w-full justify-center py-2.5 text-xs">

                    {catSaving ? 'Adding...' : 'Add Category'}

                  </button>

                </form>

              </div>



              {/* Categories list */}

              <div className="md:col-span-2 rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.78)', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 24px rgba(26,60,46,0.06)' }}>

                {catLoad ? <div className="spinner my-10"/> : (

                  <table className="w-full text-sm">

                    <thead>

                      <tr style={{ background:'rgba(26,60,46,0.04)', borderBottom:'1px solid rgba(26,60,46,0.08)' }}>

                        <th className="text-left py-3 px-5 font-ui text-[9px] tracking-[2px] uppercase text-muted font-semibold">Name</th>

                        <th className="text-left py-3 px-5 font-ui text-[9px] tracking-[2px] uppercase text-muted font-semibold w-24">Actions</th>

                      </tr>

                    </thead>

                    <tbody>

                      {categories.map(c => (

                        <tr key={c._id} className="transition-colors" style={{ borderTop:'1px solid rgba(26,60,46,0.05)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(26,60,46,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                          <td className="py-3 px-5 font-ui text-ink font-medium">{c.name}</td>

                          <td className="py-3 px-5">

                            <button onClick={()=>deleteCat(c._id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-500 transition-all" style={{border:'1px solid rgba(26,60,46,0.12)'}}>

                              <FiTrash2 size={13}/>

                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

                {!catLoad && categories.length === 0 && (

                  <p className="text-center font-ui text-muted text-sm py-16">No categories added yet.</p>

                )}

              </div>

            </div>

          </div>

        )}



        {/* ════════════ ORDERS ════════════ */}

        {tab === 'orders' && (

          <div>

            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">

              <h2 className="font-ui text-ink font-semibold">

                Orders

                <span className="ml-2 font-ui text-sm text-muted font-normal">

                  ({orders.length} {statusF ? statusF.toLowerCase() : 'total'})

                </span>

              </h2>



              {/* Filter buttons */}

              <div className="flex items-center gap-2 flex-wrap">

                {['', 'Pending', 'Accepted', 'Rejected', 'Shipped', 'Delivered'].map(s => (

                  <button

                    key={s}

                    onClick={() => handleFilterChange(s)}

                    className="px-4 py-1.5 rounded-full font-ui text-[10px] tracking-wider border transition-all"

                    style={{

                      background:   statusF === s ? '#1a3c2e' : 'rgba(255,255,255,0.7)',

                      color:        statusF === s ? '#f8f5f0' : '#7a7060',

                      borderColor:  statusF === s ? '#1a3c2e' : 'rgba(26,60,46,0.15)',

                      fontWeight:   statusF === s ? 600 : 400,

                    }}>

                    {s || 'All'}

                  </button>

                ))}

                <button

                  onClick={() => loadOrders(statusF)}

                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-muted hover:text-forest"

                  style={{ border:'1px solid rgba(26,60,46,0.15)' }}

                  title="Refresh">

                  <FiRefreshCw size={13}/>

                </button>

              </div>

            </div>



            {ordLoad ? (

              <div className="spinner"/>

            ) : orders.length === 0 ? (

              <div className="text-center py-16 rounded-2xl"

                style={{ background:'rgba(255,255,255,0.5)', border:'1px dashed rgba(26,60,46,0.15)' }}>

                <p className="font-serif italic text-xl text-ink mb-2">No orders found</p>

                <p className="font-ui text-sm text-muted">

                  {statusF ? `No ${statusF.toLowerCase()} orders yet.` : 'No orders have been placed yet.'}

                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {orders.map(order => (

                  <div key={order._id} className="rounded-2xl overflow-hidden"

                    style={{ background:'rgba(255,255,255,0.78)', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(26,60,46,0.06)' }}>



                    {/* Order header */}

                    <div className="flex justify-between items-start p-5"

                      style={{ borderBottom:'1px solid rgba(26,60,46,0.07)' }}>

                      <div>

                        <p className="font-ui text-xs font-bold text-ink tracking-wider">

                          #{order._id.slice(-8).toUpperCase()}

                        </p>

                        <p className="font-ui text-xs text-muted mt-1">

                          {order.user?.name} · {order.user?.email}

                        </p>

                        <p className="font-ui text-xs text-muted mt-0.5">{fmtDate(order.createdAt)}</p>

                      </div>

                      <div className="text-right flex flex-col gap-2 items-end">

                        <span className={statusBadge(order.status)}>{order.status}</span>

                        <p className="font-ui font-semibold" style={{ color:'#1a3c2e' }}>{fmt(order.totalAmount)}</p>

                      </div>

                    </div>



                    {/* Order items */}

                    <div className="px-5 py-3 flex flex-wrap gap-2">

                      {order.orderItems?.map((item, i) => (

                        <span key={i} className="font-ui text-[10px] px-2.5 py-1 rounded-lg text-muted"

                          style={{ background:'rgba(26,60,46,0.05)', border:'1px solid rgba(26,60,46,0.08)' }}>

                          {item.name} ×{item.quantity}

                        </span>

                      ))}

                    </div>



                    {/* Shipping address */}

                    <div className="px-5 pb-3">

                      <p className="font-ui text-[10px] text-muted">

                        📦 {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}

                      </p>

                    </div>



                    {/* Actions */}

                    {order.status === 'Pending' && (

                      <div className="px-5 pb-4 pt-3 flex flex-wrap items-center gap-3"

                        style={{ borderTop:'1px solid rgba(26,60,46,0.07)' }}>

                        <button onClick={() => updateOrder(order._id, 'Accepted')}

                          className="btn-primary py-2 px-5 text-xs">

                          <FiCheck size={12}/> Accept

                        </button>

                        <input

                          className="input-field text-xs py-2 flex-1 min-w-0 max-w-xs"

                          placeholder="Rejection reason (optional)"

                          value={reasons[order._id] || ''}

                          onChange={e => setReasons({ ...reasons, [order._id]: e.target.value })}

                        />

                        <button onClick={() => updateOrder(order._id, 'Rejected')}

                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-ui text-xs font-medium transition-all text-red-500 hover:bg-red-50"

                          style={{ border:'1px solid rgba(220,38,38,0.3)' }}>

                          <FiX size={12}/> Reject & Refund

                        </button>

                      </div>

                    )}

                    {order.status === 'Accepted' && (

                      <div className="px-5 pb-4 pt-3" style={{ borderTop:'1px solid rgba(26,60,46,0.07)' }}>

                        <button onClick={() => updateOrder(order._id, 'Shipped')} className="btn-outline py-2 px-5 text-xs">

                          Mark Shipped

                        </button>

                      </div>

                    )}

                    {order.status === 'Shipped' && (

                      <div className="px-5 pb-4 pt-3" style={{ borderTop:'1px solid rgba(26,60,46,0.07)' }}>

                        <button onClick={() => updateOrder(order._id, 'Delivered')} className="btn-outline py-2 px-5 text-xs">

                          Mark Delivered

                        </button>

                      </div>

                    )}



                    {/* Refund info */}

                    {order.refund?.isRefunded && (

                      <div className="px-5 py-2.5" style={{ background:'rgba(16,185,129,0.06)', borderTop:'1px solid rgba(16,185,129,0.15)' }}>

                        <p className="font-ui text-xs text-emerald-700">

                          ✦ Refunded {fmt(order.refund.refundAmount)} on {fmtDate(order.refund.refundedAt)} · ID: {order.refund.refundId}

                        </p>

                      </div>

                    )}



                    {/* Rejection reason */}

                    {order.status === 'Rejected' && order.rejectionReason && (

                      <div className="px-5 py-2.5" style={{ background:'rgba(239,68,68,0.04)', borderTop:'1px solid rgba(239,68,68,0.1)' }}>

                        <p className="font-ui text-xs text-red-600">Reason: {order.rejectionReason}</p>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </div>

        )}



        {/* ════════════ FEEDBACK ════════════ */}

        {tab === 'feedback' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-ui text-ink font-semibold">

                Feedback

                {feedbacks.filter(f => !f.isRead).length > 0 && (

                  <span className="ml-2 badge-amber">{feedbacks.filter(f => !f.isRead).length} unread</span>

                )}

              </h2>

              <button onClick={loadFeedback}

                className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-forest transition-all"

                style={{ border:'1px solid rgba(26,60,46,0.15)' }}>

                <FiRefreshCw size={13}/>

              </button>

            </div>



            {fbLoad ? <div className="spinner"/> : feedbacks.length === 0 ? (

              <p className="text-center font-ui text-muted text-sm py-16">No feedback yet.</p>

            ) : (

              <div className="space-y-4">

                {feedbacks.map(fb => (

                  <div key={fb._id} className="rounded-2xl overflow-hidden"

                    style={{

                      background: 'rgba(255,255,255,0.78)',

                      border:     '1px solid rgba(255,255,255,0.9)',

                      borderLeft: fb.isRead ? '3px solid rgba(26,60,46,0.1)' : '3px solid #1a3c2e',

                      opacity:    fb.isRead ? 0.75 : 1,

                      boxShadow:  '0 4px 20px rgba(26,60,46,0.05)',

                    }}>

                    <div className="flex justify-between items-start p-5">

                      <div>

                        <p className="font-ui text-sm text-ink font-semibold">

                          {fb.name}

                          <span className="font-normal text-muted text-xs ml-2">({fb.email})</span>

                        </p>

                        <p className="font-ui text-xs mt-0.5 font-medium" style={{color:'#1a3c2e'}}>{fb.subject}</p>

                        <p className="font-ui text-muted text-[10px] mt-1">{fmtDate(fb.createdAt)}</p>

                      </div>

                      {!fb.isRead ? (

                        <button onClick={() => markRead(fb._id)} className="btn-ghost py-1.5 px-3 text-[10px]">

                          <FiCheck size={11}/> Mark read

                        </button>

                      ) : (

                        <span className="badge-green">Read</span>

                      )}

                    </div>

                    <p className="font-ui text-sm text-muted leading-relaxed px-5 pb-5">{fb.message}</p>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}



      </div>

    </div>

  );

                          }
