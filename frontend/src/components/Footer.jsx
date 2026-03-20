import { Link } from 'react-router-dom';
import { FiInstagram, FiMail, FiPhone } from 'react-icons/fi';

const SOCIAL = [
  {
    Icon: FiInstagram,
    href: 'https://www.instagram.com/_.miskara._?igsh=ZjNtNG9ycTY5cTkz&utm_source=qr',
    label: 'Instagram',
  },
  {
    Icon: FiMail,
    href: 'mailto:info.miskara@gmail.com',
    label: 'Email',
  },
  {
    Icon: FiPhone,
    href: 'tel:+918222822170',
    label: 'Phone',
  },
];

export default function Footer() {
  return (
    <footer style={{ background:'#1a3c2e', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <img src="/logo.png" alt="Miskara"
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor:'rgba(201,168,76,0.3)', boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }} />
            <div>
              <span className="font-serif italic text-2xl block leading-none" style={{ color:'#f8f5f0' }}>Miskara</span>
              <span className="font-ui text-[7px] tracking-[4px] uppercase font-semibold block mt-1" style={{ color:'#c9a84c' }}>Jewellery</span>
            </div>
          </div>
          <p className="font-ui font-light text-sm leading-relaxed max-w-xs mb-5" style={{ color:'rgba(248,245,240,0.55)' }}>
            Handcrafted jewellery for women who carry their stories close — made to last forever.
          </p>

          {/* Social icons with real links */}
          <div className="flex gap-3">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a key={label} href={href}
                target={href.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded flex items-center justify-center transition-all"
                style={{ border:'1px solid rgba(255,255,255,0.1)', color:'rgba(248,245,240,0.45)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,168,76,0.4)'; e.currentTarget.style.color='#c9a84c'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(248,245,240,0.45)'; }}>
                <Icon size={14}/>
              </a>
            ))}
          </div>

          {/* Contact info */}
          <div className="mt-5 space-y-2">
            <a href="tel:+918222822170"
              className="flex items-center gap-2 font-ui text-xs transition-colors"
              style={{ color:'rgba(248,245,240,0.45)' }}
              onMouseEnter={e => e.currentTarget.style.color='#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(248,245,240,0.45)'}>
              <FiPhone size={11}/> +91 82228 22170
            </a>
            <a href="mailto:info.miskara@gmail.com"
              className="flex items-center gap-2 font-ui text-xs transition-colors"
              style={{ color:'rgba(248,245,240,0.45)' }}
              onMouseEnter={e => e.currentTarget.style.color='#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(248,245,240,0.45)'}>
              <FiMail size={11}/> info.miskara@gmail.com
            </a>
          </div>
        </div>

        {/* Shop + Help links */}
        {[
          { t:'Shop', l:[['Necklaces','/products?category=Necklace'],['Earrings','/products?category=Earrings'],['Bracelets','/products?category=Bracelet'],['Rings','/products?category=Ring']] },
          { t:'Help', l:[['Track Order','/orders'],['Contact Us','/feedback'],['Shipping Policy','#'],['Returns','#']] },
        ].map(({ t, l }) => (
          <div key={t}>
            <h4 className="font-ui font-semibold text-[10px] tracking-[3px] uppercase mb-5" style={{ color:'#c9a84c' }}>{t}</h4>
            <ul className="space-y-3">
              {l.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="font-ui font-light text-sm transition-colors"
                    style={{ color:'rgba(248,245,240,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.color='#f8f5f0'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(248,245,240,0.5)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact / Newsletter */}
        <div>
          <h4 className="font-ui font-semibold text-[10px] tracking-[3px] uppercase mb-5" style={{ color:'#c9a84c' }}>Get in Touch</h4>

          <div className="space-y-4 mb-6">
            <a href="https://www.instagram.com/_.miskara._?igsh=ZjNtNG9ycTY5cTkz&utm_source=qr"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-all group"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
              <FiInstagram size={14} style={{ color:'#c9a84c' }}/>
              <div>
                <p className="font-ui font-semibold text-[11px]" style={{ color:'#f8f5f0' }}>@_.miskara._</p>
                <p className="font-ui text-[10px]" style={{ color:'rgba(248,245,240,0.4)' }}>Follow on Instagram</p>
              </div>
            </a>

            <a href="tel:+918222822170"
              className="flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
              <FiPhone size={14} style={{ color:'#c9a84c' }}/>
              <div>
                <p className="font-ui font-semibold text-[11px]" style={{ color:'#f8f5f0' }}>+91 82228 22170</p>
                <p className="font-ui text-[10px]" style={{ color:'rgba(248,245,240,0.4)' }}>Call or WhatsApp</p>
              </div>
            </a>

            <a href="mailto:info.miskara@gmail.com"
              className="flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
              <FiMail size={14} style={{ color:'#c9a84c' }}/>
              <div>
                <p className="font-ui font-semibold text-[11px]" style={{ color:'#f8f5f0' }}>info.miskara@gmail.com</p>
                <p className="font-ui text-[10px]" style={{ color:'rgba(248,245,240,0.4)' }}>Drop us an email</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="font-ui text-xs" style={{ color:'rgba(248,245,240,0.3)' }}>
            © {new Date().getFullYear()} Miskara Jewellery. All rights reserved.
          </p>
          <p className="font-ui text-xs" style={{ color:'rgba(248,245,240,0.3)' }}>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  );
}