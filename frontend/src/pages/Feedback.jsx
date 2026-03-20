import { useState } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name:user?.name||'', email:user?.email||'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/feedback', form); setSent(true); toast.success('Message sent!'); }
    catch { toast.error('Failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-surfaceAlt min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          {/* Left */}
          <div className="pt-4">
            <span className="section-eyebrow">Get in touch</span>
            <h1 className="font-sans font-bold text-5xl text-ink leading-tight mb-6">
              We'd love to<br /><span className="font-sans italic text-accent" style={{ fontSize:'1.1em' }}>hear from you</span>
            </h1>
            <p className="font-sans text-muted text-sm leading-relaxed max-w-sm mb-10">
              Questions, custom pieces, or just want to say hello — we're here for you.
            </p>
            <div className="space-y-5">
              {[
                { icon:'✉', label:'Email', val:'Info.miskara@gmail.com' },
                { icon:'◷', label:'Response Time', val:'Within 24 hours' },
                { icon:'✦', label:'Custom Orders', val:'We love making bespoke pieces' },
              ].map(({ icon, label, val }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surfaceAlt border border-borderSoft flex items-center justify-center text-accent/70 text-sm flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="font-sans text-[9px] tracking-[2px] uppercase text-muted">{label}</p>
                    <p className="font-sans text-sm text-ink">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-surfaceAlt rounded-3xl shadow-glass-lg p-10">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-surfaceAlt mx-auto flex items-center justify-center text-2xl mb-5">✦</div>
                <h3 className="font-sans font-bold text-2xl text-ink mb-3">Message Received!</h3>
                <p className="font-sans text-muted text-sm mb-6">We'll reply to <span className="text-accent font-medium">{form.email}</span> within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-outline">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[['name','Name','Priya Sharma'],['email','Email','you@example.com']].map(([k, label, ph]) => (
                    <div key={k}>
                      <label className="block font-sans text-[9px] tracking-[2px] uppercase text-muted mb-2">{label}</label>
                      <input className="input-field" placeholder={ph} type={k==='email'?'email':'text'}
                        value={form[k]} onChange={e => setForm({...form, [k]:e.target.value})} required />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block font-sans text-[9px] tracking-[2px] uppercase text-muted mb-2">Subject</label>
                  <input className="input-field" placeholder="Order enquiry, custom piece..."
                    value={form.subject} onChange={e => setForm({...form, subject:e.target.value})} required />
                </div>
                <div>
                  <label className="block font-sans text-[9px] tracking-[2px] uppercase text-muted mb-2">Message</label>
                  <textarea className="input-field resize-none" rows={5} placeholder="Tell us anything..."
                    value={form.message} onChange={e => setForm({...form, message:e.target.value})} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4">
                  {loading ? 'Sending...' : 'Send Message ✦'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
