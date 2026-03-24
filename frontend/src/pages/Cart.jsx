import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';

import { useAuth } from '../context/AuthContext.jsx';

import { orderService } from '../services/orderService.js';

import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';

import toast from 'react-hot-toast';



const fmt = (p) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(p);



export default function Cart() {

  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ street:'', city:'', state:'', pincode:'', phone:'' });

  const [placing, setPlacing]   = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [isVerified, setIsVerified] = useState(false);

  const [verifying, setVerifying]   = useState(false);



  const handleCheckout = () => {

    if (!user) { navigate('/login'); return; }

    setShowForm(true);

  };



  // Auto-verify pincode when 6 digits are entered

  useEffect(() => {

    if (shipping.pincode.length === 6 && !isVerified) {

      handleVerify(shipping.pincode);

    }

  }, [shipping.pincode]);



  const handleVerify = async (pin = shipping.pincode) => {

    if (!/^\d{6}$/.test(pin)) return;



    setVerifying(true);

    try {

      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);

      const data = await res.json();



      if (data[0].Status === 'Success') {

        const details = data[0].PostOffice[0];

        setShipping(prev => ({

          ...prev,

          city:  details.District,

          state: details.State,

        }));

        setIsVerified(true);

        toast.success('Pincode verified! City & State autofilled.');

      } else {

        toast.error('Invalid pincode. Please check.');

      }

    } catch (err) {

      console.error('Pincode verify error:', err);

      // Silent fail for auto-verify if network is down, user can still type manually

    } finally {

      setVerifying(false);

    }

  };



  const handlePlaceOrder = async (e) => {

    e.preventDefault();



    // ── Check Razorpay key before opening ──

    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!rzpKey || rzpKey.trim() === '' || rzpKey.includes('xxx')) {

      toast.error('Payment not configured. Please contact support.');

      console.error('VITE_RAZORPAY_KEY_ID is missing or invalid in .env');

      return;

    }



    setPlacing(true);

    try {

      const { data: rzp } = await orderService.createRazorpayOrder(totalPrice);



      const options = {

        key:      rzpKey,

        amount:   rzp.amount,

        currency: 'INR',

        name:     'Miskara Jewellery',

        description: `Order of ${cartItems.length} item(s)`,

        image:    '/logo.png',

        order_id: rzp.id,



        handler: async (res) => {

          try {

            await orderService.placeOrder({

              orderItems: cartItems.map(i => ({

                product:  i._id,

                name:     i.name,

                image:    i.images?.[0]?.url || '',

                price:    i.price,

                quantity: i.quantity,

              })),

              shippingAddress: shipping,

              totalAmount:     totalPrice,

              razorpay_order_id:   res.razorpay_order_id,

              razorpay_payment_id: res.razorpay_payment_id,

              razorpay_signature:  res.razorpay_signature,

            });

            clearCart();

            toast.success('Order placed successfully! 🎉');

            navigate('/orders');

          } catch (err) {

            toast.error('Order placement failed. Please contact support.');

            console.error('Order save error:', err);

          }

        },



        prefill: {

          name:    user.name,

          email:   user.email,

          contact: user.phone || '',

        },



        notes: {

          address: `${shipping.street}, ${shipping.city}`,

        },



        theme: { color: '#1a3c2e' },



        modal: {

          ondismiss: () => {

            setPlacing(false);

            toast('Payment cancelled.', { icon: 'ℹ️' });

          },

        },

      };



      const rzpInstance = new window.Razorpay(options);



      // Handle payment failure explicitly

      rzpInstance.on('payment.failed', (response) => {

        console.error('Payment failed:', response.error);

        toast.error(`Payment failed: ${response.error.description || 'Please try again.'}`);

        setPlacing(false);

      });



      rzpInstance.open();



    } catch (err) {

      console.error('Checkout error:', err);

      toast.error('Could not initiate payment. Please try again.');

      setPlacing(false);

    }

  };



  if (cartItems.length === 0) return (

    <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background:'#f8f5f0' }}>

      <div className="text-center">

        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6"

          style={{ background:'rgba(26,60,46,0.08)', border:'2px solid rgba(26,60,46,0.15)' }}>

          <FiShoppingBag size={36} style={{ color:'#1a3c2e' }} />

        </div>

        <h2 className="font-serif italic text-3xl text-ink mb-3">Your cart is empty</h2>

        <p className="font-ui text-muted text-sm mb-8">Looks like you haven't added anything yet.</p>

        <Link to="/products" className="btn-primary">Explore Collection</Link>

      </div>

    </div>

  );



  return (

    <div className="min-h-screen pt-24 pb-20" style={{ background:'#f8f5f0' }}>

      <div className="max-w-7xl mx-auto px-6">

        <h1 className="font-serif italic text-4xl text-ink mb-10">Shopping Cart</h1>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">



          {/* ── Cart Items ── */}

          <div className="lg:col-span-2 space-y-4">

            {cartItems.map(item => (

              <div key={item._id} className="flex gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1"

                style={{ background:'rgba(255,255,255,0.78)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(26,60,46,0.06)' }}>

                <img src={item.images?.[0]?.url || ''}

                  alt={item.name}

                  className="w-20 h-24 object-cover rounded-xl flex-shrink-0"

                  style={{ border:'2px solid rgba(26,60,46,0.08)' }} />

                <div className="flex-1 min-w-0">

                  <h3 className="font-serif italic text-ink text-lg leading-snug mb-0.5">{item.name}</h3>

                  <p className="font-ui text-[10px] tracking-[2px] uppercase text-muted font-medium mb-2">{item.category} · {item.gender}</p>

                  <p className="font-ui font-semibold text-base" style={{ color:'#1a3c2e' }}>{fmt(item.price)}</p>

                </div>

                <div className="flex flex-col items-end gap-3">

                  <div className="flex items-center rounded-lg overflow-hidden"

                    style={{ border:'1.5px solid rgba(26,60,46,0.15)', background:'rgba(255,255,255,0.8)' }}>

                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)}

                      className="w-8 h-8 flex items-center justify-center text-muted hover:text-forest transition-colors">

                      <FiMinus size={11} />

                    </button>

                    <span className="w-9 text-center font-ui font-semibold text-ink text-xs"

                      style={{ borderLeft:'1px solid rgba(26,60,46,0.1)', borderRight:'1px solid rgba(26,60,46,0.1)', lineHeight:'32px' }}>

                      {item.quantity}

                    </span>

                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)}

                      className="w-8 h-8 flex items-center justify-center text-muted hover:text-forest transition-colors">

                      <FiPlus size={11} />

                    </button>

                  </div>

                  <p className="font-ui text-ink font-bold text-sm">{fmt(item.price * item.quantity)}</p>

                  <button onClick={() => removeFromCart(item._id)}

                    className="text-muted hover:text-red-400 transition-colors">

                    <FiTrash2 size={15} />

                  </button>

                </div>

              </div>

            ))}

          </div>



          {/* ── Order Summary ── */}

          <div className="rounded-2xl p-7 sticky top-24"

            style={{ background:'rgba(255,255,255,0.88)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.95)', boxShadow:'0 20px 60px rgba(26,60,46,0.1)' }}>

            <h3 className="font-serif italic text-xl text-ink mb-6">Order Summary</h3>



            <div className="space-y-3 font-ui text-sm">

              <div className="flex justify-between text-muted">

                <span>Subtotal</span>

                <span className="font-medium text-ink">{fmt(totalPrice)}</span>

              </div>

              <div className="flex justify-between text-muted">

                <span>Shipping</span>

                <span className="font-semibold text-emerald-600">Free ✓</span>

              </div>

              <div className="h-px my-2" style={{ background:'rgba(26,60,46,0.08)' }} />

              <div className="flex justify-between text-ink font-bold text-lg">

                <span>Total</span>

                <span style={{ color:'#1a3c2e' }}>{fmt(totalPrice)}</span>

              </div>

            </div>



            {!showForm ? (

              <button onClick={handleCheckout} className="btn-primary w-full justify-center py-4 mt-6">

                Proceed to Checkout →

              </button>

            ) : (

              <form onSubmit={handlePlaceOrder} className="mt-5 space-y-3">

                <p className="font-ui font-semibold text-[10px] tracking-[3px] uppercase mb-3" style={{ color:'#1a3c2e' }}>

                  Shipping Address

                </p>

                {[

                  ['pincode', 'Pincode',         'text'],

                  ['street',  'Street address', 'text'],

                  ['city',    'City',            'text'],

                  ['state',   'State',           'text'],

                  ['phone',   'Phone number',    'tel'],

                ].map(([k, ph, type]) => (

                  <input

                    key={k}

                    type={type}

                    className="input-field text-xs py-3"

                    placeholder={ph}

                    value={shipping[k]}

                    onChange={e => {

                      setShipping({ ...shipping, [k]: e.target.value });

                      if (k === 'pincode') setIsVerified(false);

                    }}

                    required

                     minLength={k === 'pincode' ? 6 : k === 'phone' ? 10 : 2}

                     maxLength={k === 'pincode' ? 6 : k === 'phone' ? 10 : undefined}

                     pattern={k === 'pincode' ? '[0-9]{6}' : k === 'phone' ? '[0-9]{10}' : undefined}

                     title={k === 'pincode' ? '6-digit pincode' : k === 'phone' ? '10-digit phone number' : undefined}

                  />

                ))}



                {verifying && (

                  <p className="font-ui text-[10px] text-forest animate-pulse text-center">

                    Fetching address details for {shipping.pincode}...

                  </p>

                )}



                <button

                  type="submit"

                  disabled={

                    placing || 

                    verifying || 

                    !isVerified ||

                    shipping.pincode.length !== 6 ||

                    shipping.street.length < 5 ||

                    shipping.city.length < 2 ||

                    shipping.state.length < 2 ||

                    shipping.phone.length < 10

                  }

                  className="btn-primary w-full justify-center py-4 mt-2"

                  style={{ 

                    opacity: (

                      placing || 

                      !isVerified || 

                      verifying || 

                      shipping.pincode.length !== 6 ||

                      shipping.street.length < 5 ||

                      shipping.city.length < 2 ||

                      shipping.state.length < 2 ||

                      shipping.phone.length < 10

                    ) ? 0.75 : 1 

                  }}>

                  {placing ? (

                    <span className="flex items-center gap-2">

                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Processing...

                    </span>

                  ) : '🔒 Pay Now'}

                </button>

              </form>

            )}



            <p className="font-ui text-center text-[10px] text-muted mt-4 tracking-[2px] uppercase">

              Secured by Razorpay

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}
