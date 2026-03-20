import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const from      = useLocation().state?.from?.pathname || '/';
  const [form, setForm]       = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');   // ← inline error state

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');           // clear old error
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      // Show error inline inside the form — easy to see
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('email')) {
        setError('Email or password is incorrect. Please try again.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background:'#f8f5f0' }}>
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-20"
        style={{ background:'radial-gradient(circle at 80% 10%, rgba(26,60,46,0.12), transparent 65%)' }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none opacity-15"
        style={{ background:'radial-gradient(circle at 20% 80%, rgba(201,168,76,0.1), transparent 65%)' }} />

      <div className="w-full max-w-md relative">
        <div className="rounded-2xl p-10"
          style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 20px 60px rgba(26,60,46,0.1), 0 4px 16px rgba(0,0,0,0.04)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full blur-md opacity-25" style={{ background:'rgba(26,60,46,0.5)' }} />
              <img src="/logo.png" alt="Miskara"
                className="relative w-16 h-16 rounded-full object-cover border-2 border-white"
                style={{ boxShadow:'0 8px 24px rgba(26,60,46,0.15)' }} />
            </div>
            <span className="font-serif italic text-3xl text-ink">Miskara</span>
            <span className="font-ui text-[8px] tracking-[4px] uppercase font-semibold mt-1" style={{ color:'#1a3c2e' }}>Jewellery</span>
          </div>

          <h2 className="font-serif italic text-2xl text-center text-ink mb-1">Welcome back</h2>
          <p className="font-ui text-center text-xs tracking-wider text-muted mb-8">Sign in to your account</p>

          {/* ── Inline error box ── */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
              style={{ background:'rgba(220,38,38,0.06)', border:'1.5px solid rgba(220,38,38,0.2)' }}>
              <FiAlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="font-ui text-sm text-red-600 font-medium leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2 mb-2">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => { setError(''); setForm({ ...form, email: e.target.value }); }}
                style={{ borderColor: error ? 'rgba(220,38,38,0.4)' : undefined }}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2">Password</label>
                <Link to="/forgot-password"
                  className="font-ui text-[11px] font-semibold transition-colors hover:underline"
                  style={{ color:'#1a3c2e' }}>
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setError(''); setForm({ ...form, password: e.target.value }); }}
                  style={{ borderColor: error ? 'rgba(220,38,38,0.4)' : undefined }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
                  style={{ background:'none', border:'none' }}>
                  {showPwd ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-4 mt-2"
              style={{ opacity: loading ? 0.75 : 1 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px" style={{ background:'rgba(26,60,46,0.08)' }} />
            <span className="font-ui text-xs text-muted2">or</span>
            <span className="flex-1 h-px" style={{ background:'rgba(26,60,46,0.08)' }} />
          </div>

          <p className="text-center font-ui text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors hover:underline" style={{ color:'#1a3c2e' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
