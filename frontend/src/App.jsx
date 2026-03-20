import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Orders from './pages/Orders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Feedback from './pages/Feedback.jsx';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/products"       element={<Products />} />
        <Route path="/products/:id"   element={<ProductDetails />} />
        <Route path="/cart"           element={<Cart />} />
        <Route path="/wishlist"       element={<Wishlist />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/verify-email"   element={<PrivateRoute><VerifyEmail /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/feedback"       element={<Feedback />} />
        <Route path="/orders"         element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}