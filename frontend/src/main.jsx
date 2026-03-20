import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
          <Toaster position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily:"'Jost',sans-serif",
                fontSize:'13px',
                fontWeight:'500',
                background:'rgba(255,255,255,0.95)',
                color:'#1a1a14',
                border:'1px solid rgba(26,60,46,0.12)',
                borderRadius:'6px',
                boxShadow:'0 8px 32px rgba(26,60,46,0.1)',
                backdropFilter:'blur(20px)',
              },
              success: { duration:3000, iconTheme:{ primary:'#1a3c2e', secondary:'white' } },
              error:   { duration:5000, style:{ border:'1px solid rgba(220,38,38,0.2)' } },
            }}/>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);