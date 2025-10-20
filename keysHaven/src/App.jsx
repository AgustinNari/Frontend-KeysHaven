import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navigation from './components/ui/Navigation';
import Footer from './components/ui/Footer';

import Home from './views/Home';
import Catalog from './views/Catalog';
import ProductDetail from './views/ProductDetail';
import Cart from './views/Cart';
import Login from './views/Login';
import Register from './views/Register';
import NotFound from './views/NotFound';
import Profile from './views/Profile';

import Checkout from './views/Checkout';
import OrderConfirmation from './views/OrderConfirmation';

import AdminPanel from './components/admin/AdminPanel';
import AdminDashboard from './components/admin/AdminDashboard';
import CategoryManagement from './components/admin/CategoryManagement';
import CouponManagement from './components/admin/CouponManagement';
import ProductManagement from './components/admin/ProductManagement';
import UserManagement from './components/admin/UserManagement';

import SellerDashboard from './components/seller/SellerDashboard';
import ProductList from './components/seller/ProductList';
import ProductForm from './components/seller/ProductForm';
import SalesAnalytics from './components/seller/SalesAnalytics';
import SellerCoupons from './components/seller/SellerCoupons';
import KeyManagement from './components/seller/KeyManagement';

export default function App() {
  return (
    <>
      <Navigation />

      <main className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/adminpanel/*" element={<AdminPanel />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/coupons" element={<CouponManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />

          <Route path="/seller/*" element={<SellerDashboard />} />
          <Route path="/sellerdashboard/*" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<ProductList />} />
          <Route path="/seller/products/new" element={<ProductForm />} />
          <Route path="/seller/products/edit/:id" element={<ProductForm />} />
          <Route path="/seller/analytics" element={<SalesAnalytics />} />
          <Route path="/seller/coupons" element={<SellerCoupons />} />
          <Route path="/seller/keys" element={<KeyManagement />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
