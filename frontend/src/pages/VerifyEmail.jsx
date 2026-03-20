import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['','','','','','']);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await authService.verifyEmail({ otp: code });
      updateUser({ isEmailVerified: true });
      toast.success('Email verified! Welcome to Miskara ✦');
      navigate('/');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['','','','','','']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOTP();
      toast.success('New OTP sent to your email');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally { setResending(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background:'#f8f5f0' }}>
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-20"
        style={{ background:'radial-gradient(circle at 80% 10%, rgba(26,60,46,0.15), transparent 60%)' }} />

      <div className="w-full max-w-md">
        <div className="rounded-2xl p-10"
          style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 20px 60px rgba(26,60,46,0.1)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Miskara" className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-white"
              style={{ boxShadow:'0 8px 24px rgba(26,60,46,0.15)' }} />
            <span className="font-serif italic text-3xl text-ink">Miskara</span>
            <span className="font-ui text-[8px] tracking-[4px] uppercase font-semibold mt-1" style={{ color:'#1a3c2e' }}>Jewellery</span>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
            style={{ background:'rgba(26,60,46,0.08)', border:'1px solid rgba(26,60,46,0.12)' }}>
            ✉️
          </div>

          <h2 className="font-serif italic text-2xl text-center text-ink mb-2">Verify Your Email</h2>
          <p className="font-ui text-center text-sm text-muted mb-1">
            We sent a 6-digit code to
          </p>
          <p className="font-ui font-semibold text-center text-sm mb-8" style={{ color:'#1a3c2e' }}>
            {user?.email}
          </p>

          <form onSubmit={handleSubmit}>
            {/* OTP boxes */}
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  className="w-12 h-14 text-center text-xl font-bold text-ink rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: digit ? '2px solid #1a3c2e' : '1.5px solid rgba(26,60,46,0.15)',
                    boxShadow: digit ? '0 0 0 3px rgba(26,60,46,0.08)' : 'none',
                    fontFamily: 'Jost, sans-serif',
                  }}
                  onFocus={e => e.currentTarget.style.border='2px solid #1a3c2e'}
                  onBlur={e => { if (!digit) e.currentTarget.style.border='1.5px solid rgba(26,60,46,0.15)'; }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 mb-5">
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="text-center">
            <p className="font-ui text-sm text-muted mb-2">Didn't receive the code?</p>
            <button onClick={handleResend} disabled={resending}
              className="font-ui font-semibold text-sm transition-colors"
              style={{ color:'#1a3c2e', background:'none', border:'none' }}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <p className="font-ui text-xs text-center text-muted2 mt-5">
            OTP expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
