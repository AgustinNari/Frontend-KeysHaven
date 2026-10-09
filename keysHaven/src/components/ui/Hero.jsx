import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="home-hero card p-4 mb-4">
        <div className="hero-left">
            <h1>KeysHaven</h1>
            <p className="lead">Demostración de tienda de claves digitales (contenido de ejemplo)</p>
            <div>
            <Link className="btn btn-primary me-2" to="/catalog">Explorar catálogo</Link>
            <Link className="btn btn-outline-secondary" to="/cart">Ver carrito</Link>
            </div>
        </div>
        <div className="hero-right text-muted">
            <h5>Resumen</h5>
            <p>Vendedores destacados, ofertas y novedades (contenido de ejemplo).</p>
        </div>
        </section>
    );
}
