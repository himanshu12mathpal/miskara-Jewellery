import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]     = useState(1); // 1=form, 2=OTP
  const [form, setForm]     = useState({ name:'', email:'', password:'', phone:'' });
  const [otp, setOtp]       = useState(['','','','','','']);
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]   = useState('');
  const inputs = useRef([]);

  // ── Step 1: Submit form → send OTP ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP → account created in DB ──
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await authService.verifyRegister({ email: form.email, otp: code });
      // Auto login after successful verification
      localStorage.setItem('miskara_user', JSON.stringify(data));
      window.location.href = '/'; // full reload to update auth state
      toast.success('Account created! Welcome to Miskara ✦');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['','','','','','']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await authService.resendRegisterOTP({ email: form.email });
      toast.success('New OTP sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally { setResending(false); }
  };

  // OTP input handlers
  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const next = [...otp]; next[idx] = ''; setOtp(next); return;
    }
    const digit = val[val.length - 1];
    const next = [...otp]; next[idx] = digit; setOtp(next);
    if (idx < 5) setTimeout(() => inputs.current[idx + 1]?.focus(), 0);
  };
  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace') {
      if (otp[idx]) { const next = [...otp]; next[idx] = ''; setOtp(next); }
      else if (idx > 0) inputs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus();
    else if (e.key === 'ArrowRight' && idx < 5) inputs.current[idx + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (p) {
      const next = ['','','','','',''];
      p.split('').forEach((d,i) => { next[i] = d; });
      setOtp(next);
      setTimeout(() => inputs.current[Math.min(p.length, 5)]?.focus(), 0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background:'#f8f5f0' }}>
      <div className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none opacity-20"
        style={{ background:'radial-gradient(circle, rgba(26,60,46,0.1), transparent 65%)' }} />

      <div className="w-full max-w-md relative">
        <div className="rounded-2xl p-10"
          style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 20px 60px rgba(26,60,46,0.1)' }}>

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

          {/* ── STEP 1: Registration form ── */}
          {step === 1 && (<>
            <h2 className="font-serif italic text-2xl text-center text-ink mb-1">Create account</h2>
            <p className="font-ui text-center text-xs tracking-wider text-muted mb-8">Join the Miskara family</p>

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
                style={{ background:'rgba(220,38,38,0.06)', border:'1.5px solid rgba(220,38,38,0.2)' }}>
                <FiAlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="font-ui text-sm text-red-600 font-medium leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { k:'name',  l:'Full Name', t:'text',  p:'Priya Sharma' },
                { k:'email', l:'Email',     t:'email', p:'you@example.com' },
                { k:'phone', l:'Phone (optional)', t:'tel', p:'+91 98765 43210', r:false },
              ].map(({ k, l, t, p, r=true }) => (
                <div key={k}>
                  <label className="block font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2 mb-2">{l}</label>
                  <input type={t} className="input-field" placeholder={p} required={r}
                    value={form[k]}
                    onChange={e => { setError(''); setForm({...form, [k]:e.target.value}); }} />
                </div>
              ))}
              <div>
                <label className="block font-ui font-semibold text-[10px] tracking-[2px] uppercase text-muted2 mb-2">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} className="input-field pr-12"
                    placeholder="Min 6 characters" required minLength={6}
                    value={form.password}
                    onChange={e => { setError(''); setForm({...form, password:e.target.value}); }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-forest transition-colors"
                    style={{ background:'none', border:'none' }}>
                    {showPwd ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : 'Send Verification Code'}
              </button>
            </form>

            <p className="text-center font-ui text-sm text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color:'#1a3c2e' }}>Sign in</Link>
            </p>
          </>)}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 2 && (<>
            <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl"
              style={{ background:'rgba(26,60,46,0.08)', border:'1px solid rgba(26,60,46,0.12)' }}>
              ✉️
            </div>
            <h2 className="font-serif italic text-2xl text-center text-ink mb-2">Verify Your Email</h2>
            <p className="font-ui text-center text-sm text-muted mb-1">We sent a 6-digit code to</p>
            <p className="font-ui font-semibold text-center text-sm mb-7" style={{ color:'#1a3c2e' }}>{form.email}</p>

            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5"
                style={{ background:'rgba(220,38,38,0.06)', border:'1.5px solid rgba(220,38,38,0.2)' }}>
                <FiAlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="font-ui text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerify}>
              {/* 6 OTP boxes */}
              <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e, i)}
                    onKeyDown={e => handleOtpKey(e, i)}
                    onFocus={e => e.target.select()}
                    className="w-12 h-14 text-center text-xl font-bold text-ink rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.8)',
                      border: digit ? '2px solid #1a3c2e' : '1.5px solid rgba(26,60,46,0.15)',
                      boxShadow: digit ? '0 0 0 3px rgba(26,60,46,0.08)' : 'none',
                      fontFamily: 'Jost, sans-serif',
                    }}
                    onBlur={e => { if (!digit) e.currentTarget.style.border='1.5px solid rgba(26,60,46,0.15)'; }}
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.join('').length < 6}
                className="btn-primary w-full justify-center py-4 mb-5"
                style={{ opacity: otp.join('').length < 6 ? 0.6 : 1 }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : 'Verify & Create Account'}
              </button>
            </form>

            <div className="text-center space-y-3">
              <p className="font-ui text-sm text-muted">Didn't receive the code?</p>
              <button onClick={handleResend} disabled={resending}
                className="font-ui font-semibold text-sm transition-colors"
                style={{ color:'#1a3c2e', background:'none', border:'none', opacity: resending ? 0.5 : 1 }}>
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
              <div>
                <button onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}
                  className="font-ui text-xs text-muted hover:text-forest transition-colors"
                  style={{ background:'none', border:'none' }}>
                  ← Change email
                </button>
              </div>
            </div>
            <p className="font-ui text-xs text-center text-muted2 mt-4">OTP expires in 10 minutes</p>
          </>)}

        </div>
      </div>
    </div>
  );
}