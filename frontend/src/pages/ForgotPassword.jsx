import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

// Card component bahar hi rakha hai taaki focus lose na ho
const Card = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background:'#f8f5f0' }}>
    <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-20"
      style={{ background:'radial-gradient(circle at 80% 10%, rgba(26,60,46,0.15), transparent 60%)' }} />
    <div className="w-full max-w-md">
      <div className="rounded-2xl p-10"
        style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 20px 60px rgba(26,60,46,0.1)' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Miskara" className="w-14 h-14 rounded-full object-cover mb-3 border-2 border-white"
            style={{ boxShadow:'0 8px 24px rgba(26,60,46,0.15)' }} />
          <span className="font-serif italic text-2xl text-ink">Miskara</span>
          <span className="font-ui text-[8px] tracking-[4px] uppercase font-semibold mt-1" style={{ color:'#1a3c2e' }}>Jewellery</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState(['','','','','','']);
  const [pwd1, setPwd1]       = useState('');
  const [pwd2, setPwd2]       = useState('');
  const [show1, setShow1]     = useState(false);
  const [show2, setShow2]     = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  // OTP handlers
  const handleOtpChange = (e, idx) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      const next = [...otp]; next[idx] = ''; setOtp(next); return;
    }
    const digit = raw.slice(-1);
    const next = [...otp]; next[idx] = digit; setOtp(next);
    if (idx < 5) setTimeout(() => { inputs.current[idx+1]?.focus(); inputs.current[idx+1]?.select(); }, 0);
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (otp[idx]) { const next = [...otp]; next[idx] = ''; setOtp(next); }
      else if (idx > 0) { inputs.current[idx-1]?.focus(); inputs.current[idx-1]?.select(); }
    } else if (e.key === 'ArrowLeft'  && idx > 0) inputs.current[idx-1]?.focus();
      else if (e.key === 'ArrowRight' && idx < 5) inputs.current[idx+1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!p) return;
    const next = ['','','','','',''];
    p.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    setTimeout(() => inputs.current[Math.min(p.length, 5)]?.focus(), 0);
  };

  // Step handlers
  const sendOTP = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (pwd1 !== pwd2) { toast.error('Passwords do not match'); return; }
    if (pwd1.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      await authService.resetPassword({ otp: otp.join(''), password: pwd1 });
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  const otpComplete = otp.every(d => d !== '');

  // Step 1
  if (step === 1) return (
    <Card>
      <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl"
        style={{ background:'rgba(26,60,46,0.08)' }}>🔑</div>
      <h2 className="font-serif italic text-2xl text-center text-ink mb-2">Forgot Password?</h2>
      <p className="font-ui text-center text-sm text-muted mb-8">Enter your email and we'll send a reset code.</p>
      <form onSubmit={sendOTP} className="space-y-4">
        <input type="email" className="input-field w-full" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
    </Card>
  );

  // Step 2
  if (step === 2) return (
    <Card>
      <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl"
        style={{ background:'rgba(26,60,46,0.08)' }}>📩</div>
      <h2 className="font-serif italic text-2xl text-center text-ink mb-2">Enter OTP</h2>
      <p className="font-ui text-center text-sm text-muted mb-8">We sent a 6-digit code to your email.</p>
      
      <div className="flex gap-2 sm:gap-3 justify-center mb-8" onPaste={handlePaste}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            value={d}
            onChange={e => handleOtpChange(e, i)}
            onKeyDown={e => handleOtpKey(e, i)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3c2e] focus:border-transparent transition-all"
          />
        ))}
      </div>
      <button 
        onClick={() => setStep(3)} 
        disabled={!otpComplete} 
        className="btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed">
        Continue
      </button>
    </Card>
  );

  // Step 3
  return (
    <Card>
      <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl"
        style={{ background:'rgba(26,60,46,0.08)' }}>🔒</div>
      <h2 className="font-serif italic text-2xl text-center text-ink mb-2">New Password</h2>
      <p className="font-ui text-center text-sm text-muted mb-8">Create a new secure password.</p>

      <form onSubmit={handleReset} className="space-y-4">
        <div className="relative">
          <input
            type={show1 ? "text" : "password"}
            className="input-field w-full pr-12"
            placeholder="Min 6 characters"
            value={pwd1}
            onChange={e => setPwd1(e.target.value)}
            required
            minLength={6}
          />
          <button 
            type="button" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a3c2e] transition-colors" 
            onClick={() => setShow1(p => !p)}
          >
            {show1 ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
          </button>
        </div>

        <div className="relative">
          <input
            type={show2 ? "text" : "password"}
            className="input-field w-full pr-12"
            placeholder="Repeat password"
            value={pwd2}
            onChange={e => setPwd2(e.target.value)}
            required
            minLength={6}
          />
          <button 
            type="button" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a3c2e] transition-colors" 
            onClick={() => setShow2(p => !p)}
          >
            {show2 ? <FiEyeOff size={20}/> : <FiEye size={20}/>}
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-4">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </Card>
  );
}