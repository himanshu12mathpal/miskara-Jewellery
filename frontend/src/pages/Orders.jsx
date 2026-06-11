import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { FiPackage } from 'react-icons/fi';

const fmt = (p) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(p);
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
const statusBadge = { Pending:'badge-amber', Accepted:'badge-green', Rejected:'badge-red', Shipped:'badge-blue', Delivered:'badge-green' };

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="bg-surfaceAlt min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-sans font-bold text-4xl text-ink mb-10">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-surfaceAlt mx-auto flex items-center justify-center mb-6">
              <FiPackage size={36} className="text-warm" />
            </div>
            <h3 className="font-sans font-bold text-2xl text-ink mb-2">No orders yet</h3>
            <p className="font-sans text-sm text-muted mb-8">Your orders will appear here once placed.</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => (
              <div key={order._id} className="bg-surfaceAlt rounded-2xl shadow-glass overflow-hidden hover:shadow-glass-lg transition-all">
                {/* Header */}
                <div className="flex justify-between items-start p-5 border-b border-borderSoft">
                  <div>
                    <p className="font-sans text-xs font-medium text-ink tracking-wider">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-sans text-xs text-muted mt-1">{fmtDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right flex flex-col gap-2 items-end">
                    <span className={statusBadge[order.status] || 'badge-accent'}>{order.status}</span>
                    <p className="font-sans text-accent font-medium">{fmt(order.totalAmount)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3">
                  {order.orderItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-borderSoft flex-shrink-0" />}
                      <div>
                        <p className="font-sans text-sm text-ink">{item.name}</p>
                        <p className="font-sans text-xs text-muted">Qty: {item.quantity} · {fmt(item.price)}</p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && <p className="font-sans text-xs text-muted pl-14">+{order.orderItems.length - 3} more items</p>}
                </div>

                {/* Refund notice */}
                {order.refund?.isRefunded && (
                  <div className="mx-5 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="font-sans text-xs text-emerald-700">✦ Refund of {fmt(order.refund.refundAmount)} initiated on {fmtDate(order.refund.refundedAt)}</p>
                  </div>
                )}
                {order.rejectionReason && <p className="font-sans text-xs text-red-500 px-5 pb-3">Reason: {order.rejectionReason}</p>}

                {/* Shipping */}
                <div className="px-5 py-3 bg-surfaceAlt rounded-b-2xl">
                  <p className="font-sans text-xs text-muted">📦 {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
