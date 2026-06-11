import { useEffect, useState } from 'react';
import { reviewService } from '../services/reviewService.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiStar, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

/* ── Render N filled / empty stars ── */
function Stars({ rating, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (hover || rating) >= n;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(n)}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            className={`transition-all duration-150 ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            style={{ background: 'none', border: 'none', padding: '1px' }}
          >
            <FiStar
              size={size}
              fill={filled ? '#2d6147' : 'none'}
              stroke={filled ? '#2d6147' : '#c4dbc9'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ── Rating breakdown bar ── */
function RatingBar({ count, total, label }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="font-ui text-xs text-muted w-3">{label}</span>
      <FiStar size={10} fill="#2d6147" stroke="#2d6147" />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,60,46,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1a3c2e, #4a9470)' }} />
      </div>
      <span className="font-ui text-xs text-muted w-6 text-right">{count}</span>
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });

  const fetchReviews = async () => {
    try {
      const { data } = await reviewService.getByProduct(productId);
      setReviews(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  /* ── aggregates ── */
  const avgRating   = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const ratingCount = [5,4,3,2,1].map(n => ({ n, c: reviews.filter(r => r.rating === n).length }));

  const myReview = reviews.find(r => r.user === user?._id || r.user?._id === user?._id);

  const openEdit = (r) => {
    setEditId(r._id);
    setForm({ rating: r.rating, title: r.title, comment: r.comment });
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm({ rating:0, title:'', comment:'' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await reviewService.update(editId, form);
        toast.success('Review updated');
      } else {
        await reviewService.add(productId, form);
        toast.success('Review added! Thank you ✦');
      }
      cancelForm();
      fetchReviews();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewService.delete(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch { toast.error('Failed to delete'); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  return (
    <div className="mt-20">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-10 pb-5"
        style={{ borderBottom: '1px solid rgba(26,60,46,0.1)' }}>
        <div>
          <div className="section-label mb-4">Customer Reviews</div>
          <div className="flex items-end gap-5">
            {/* Big rating number */}
            <div className="text-center">
              <p className="font-serif italic text-6xl text-ink leading-none">{avgRating}</p>
              <div className="mt-2"><Stars rating={Math.round(Number(avgRating))} size={16} /></div>
              <p className="font-ui text-xs text-muted mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Breakdown bars */}
            {reviews.length > 0 && (
              <div className="flex-1 max-w-xs space-y-1.5 mb-1">
                {ratingCount.map(({ n, c }) => (
                  <RatingBar key={n} label={n} count={c} total={reviews.length} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Write review button */}
        {user && !myReview && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-outline py-2.5 px-6 text-[11px]">
            Write a Review
          </button>
        )}
      </div>

      {/* ── Review Form ── */}
      {showForm && (
        <div className="mb-10 rounded-2xl p-7 relative"
          style={{ background:'rgba(26,60,46,0.03)', border:'1px solid rgba(26,60,46,0.1)' }}>
          {/* Green accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background:'linear-gradient(90deg, #1a3c2e, #4a9470, transparent)' }} />

          <h4 className="font-serif italic text-xl text-ink mb-6">
            {editId ? 'Edit Your Review' : 'Share Your Experience'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star picker */}
            <div>
              <label className="block font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2 mb-3">
                Your Rating <span style={{ color:'#1a3c2e' }}>*</span>
              </label>
              <div className="flex items-center gap-3">
                <Stars rating={form.rating} size={28} interactive onChange={(n) => setForm({ ...form, rating: n })} />
                {form.rating > 0 && (
                  <span className="font-ui font-semibold text-sm" style={{ color:'#1a3c2e' }}>
                    {['','Poor','Fair','Good','Very Good','Excellent'][form.rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2 mb-2">
                Review Title <span style={{ color:'#1a3c2e' }}>*</span>
              </label>
              <input
                className="input-field"
                placeholder="Summarise your experience in a few words"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required maxLength={100}
              />
            </div>

            <div>
              <label className="block font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2 mb-2">
                Your Review <span style={{ color:'#1a3c2e' }}>*</span>
              </label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Tell others about this piece — quality, fit, occasion..."
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                required maxLength={1000}
              />
              <p className="font-ui text-xs text-muted2 mt-1 text-right">{form.comment.length}/1000</p>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary py-3 px-7">
                <FiCheck size={14} /> {submitting ? 'Submitting...' : editId ? 'Update Review' : 'Submit Review'}
              </button>
              <button type="button" onClick={cancelForm} className="btn-ghost py-3 px-6">
                <FiX size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Reviews list ── */}
      {loading ? (
        <div className="spinner" />
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background:'rgba(26,60,46,0.03)', border:'1px dashed rgba(26,60,46,0.1)' }}>
          <div className="text-4xl mb-3">✦</div>
          <p className="font-serif italic text-xl text-ink mb-2">No reviews yet</p>
          <p className="font-ui text-sm text-muted mb-5">Be the first to share your experience with this piece.</p>
          {user && !showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary py-3 px-7">Write First Review</button>
          )}
          {!user && <p className="font-ui text-sm text-muted"><a href="/login" style={{ color:'#1a3c2e', fontWeight:600 }}>Sign in</a> to leave a review</p>}
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => {
            const isOwn  = r.user === user?._id || r.user?._id === user?._id;
            const isAdmin = user?.role === 'admin';
            return (
              <div key={r._id} className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: isOwn ? 'rgba(26,60,46,0.04)' : 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(12px)',
                  border: isOwn ? '1px solid rgba(26,60,46,0.15)' : '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 20px rgba(26,60,46,0.05)',
                }}>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-ui font-bold text-sm flex-shrink-0"
                      style={{ background:'linear-gradient(135deg, #1a3c2e, #4a9470)' }}>
                      {r.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-ui font-semibold text-sm text-ink">{r.name}</span>
                        {isOwn && <span className="tag-green text-[9px] py-0.5 px-2">Your Review</span>}
                        <span className="font-ui text-xs text-muted2">{fmtDate(r.createdAt)}</span>
                      </div>
                      <div className="mt-1.5 mb-3">
                        <Stars rating={r.rating} size={13} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {(isOwn || isAdmin) && (
                    <div className="flex gap-2 flex-shrink-0">
                      {isOwn && (
                        <button onClick={() => openEdit(r)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-forest transition-all"
                          style={{ border:'1px solid rgba(26,60,46,0.1)', background:'rgba(255,255,255,0.7)' }}>
                          <FiEdit2 size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(r._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-500 transition-all"
                        style={{ border:'1px solid rgba(26,60,46,0.1)', background:'rgba(255,255,255,0.7)' }}>
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="ml-14">
                  <p className="font-serif italic text-ink text-base font-medium mb-2">{r.title}</p>
                  <p className="font-ui font-light text-muted leading-relaxed text-sm">{r.comment}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Not logged in prompt */}
      {!user && reviews.length > 0 && (
        <div className="mt-8 p-5 rounded-xl text-center"
          style={{ background:'rgba(26,60,46,0.04)', border:'1px solid rgba(26,60,46,0.1)' }}>
          <p className="font-ui text-sm text-muted">
            <a href="/login" style={{ color:'#1a3c2e', fontWeight:600 }}>Sign in</a>
            {' '}to leave your review
          </p>
        </div>
      )}
    </div>
  );
}
