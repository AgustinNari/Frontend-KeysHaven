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

export default function App() {
  return (
    <>
      <Navigation />

      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
