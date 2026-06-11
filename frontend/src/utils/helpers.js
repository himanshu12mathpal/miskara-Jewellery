export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const getStatusBadgeClass = (status) => {
  const map = { Pending: 'badge-gold', Accepted: 'badge-green', Rejected: 'badge-red', Shipped: 'badge-blue', Delivered: 'badge-green' };
  return map[status] || 'badge-gold';
};

export const truncate = (str, len = 80) => str?.length > len ? str.slice(0, len) + '...' : str;
