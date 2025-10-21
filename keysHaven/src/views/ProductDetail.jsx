import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";
import { PRODUCTS } from "../data/products.js";
import { MOCK_PRODUCT_DETAIL } from "../data/mockProductDetail";
import { MOCK_SELLER_DETAIL } from "../data/mockSeller";
import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";
import ActivationSteps from "../components/product/ActivationSteps.jsx";

import ImageCarousel from "../components/product/ImageCarousel";
import SellerCard from "../components/product/SellerCard";
import RelatedProducts from "../components/product/RelatedProducts";
import ReviewList from "../components/product/ReviewList";
import Rating from "../components/catalog/Rating";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("descripcion");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const detail = id == MOCK_PRODUCT_DETAIL.id ? MOCK_PRODUCT_DETAIL : { ...MOCK_PRODUCT_DETAIL, id: parseInt(id) };

        const imgs = (detail.images || []).slice().sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return (a.name || "").localeCompare(b.name || "");
        });

        setProduct(detail);
        setProductImages(imgs);
        setActiveImageIndex(0);
        window.scrollTo(0, 0);

        const sellerDetail = MOCK_SELLER_DETAIL;
        setSeller(sellerDetail);

        const sProducts = PRODUCTS.filter(p => p.sellerId === detail.sellerId && p.id !== detail.id).slice(0, 6);
        setSellerProducts(sProducts);

        setReviews(detail.reviews || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="text-center">
          <h4 style={{ color: "var(--text)" }}>Producto no encontrado</h4>
          <Link to="/catalog" className="btn btn-primary mt-3">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  let related = PRODUCTS.filter(p => {
    if (!p.categories || !product.categories) return false;
    const pCats = p.categories.map(c => (typeof c === "string" ? c : c.description));
    const prodCats = product.categories.map(c => (typeof c === "string" ? c : c.description));
    return p.id !== product.id && pCats.some(pc => prodCats.includes(pc));
  }).slice(0, 4);

  if (related.length === 0) {
    related = sellerProducts.slice(0, 4);
  }

  return (
    <div className="product-page">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/catalog">Catálogo</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.title}</li>
        </ol>
      </nav>

      <div className="product-layout">
        <div className="product-left">
          <div className="card shadow-sm mb-4 p-3">
            <ImageCarousel images={productImages} activeIndex={activeImageIndex} setActiveIndex={setActiveImageIndex} />
          </div>

          <div className="card shadow-sm mb-3 p-3">
            <h3 style={{ margin: 0, color: "var(--text)" }}>{product.title}</h3>
            <div className="product-stats mt-2">
              <div className="stat"><strong style={{ color: "var(--text)" }}>${product.price}</strong></div>
              <div className="stat"><Rating value={product.avgRating ?? product.avgRating} count={product.ratingCount ?? 0} size={14} /></div>
              <div className="stat muted">Reseñas: <strong style={{ color: "var(--text)" }}>{product.ratingCount ?? 0}</strong></div>
              <div className="stat muted">Ventas: <strong style={{ color: "var(--text)" }}>{product.sold ?? 0}</strong></div>
              <div className="stat muted">Stock: <strong style={{ color: "var(--text)" }}>{product.stock ?? 0}</strong></div>
              <div className="stat muted">Lanzamiento: <strong style={{ color: "var(--text)" }}>{product.releaseDate ? new Date(product.releaseDate).toLocaleDateString() : "N/A"}</strong></div>
              <div className="stat muted">Metacritic: <strong style={{ color: "var(--text)" }}>{product.metacriticScore ?? "N/A"}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm mt-3 mb-4">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'descripcion' ? 'active' : ''}`} onClick={() => setActiveTab('descripcion')}>Descripción</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'vendedor' ? 'active' : ''}`} onClick={() => setActiveTab('vendedor')}>Más de este vendedor</button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === 'descripcion' && (
                <>
                  <h5 className="text-primary">Acerca del juego</h5>
                  <p className="muted">{product.description}</p>
                  <p className="muted">Desarrollador: <strong style={{ color: "var(--text)" }}>{product.developer}</strong></p>
                  <p className="muted">Publisher: <strong style={{ color: "var(--text)" }}>{product.publisher}</strong></p>
                  <p className="muted">Categorías: <strong style={{ color: "var(--text)" }}>{product.categories?.map(c => (typeof c === "string" ? c : c.description)).join(", ")}</strong></p>
                </>
              )}

              {activeTab === 'vendedor' && (
                <>
                  <h5 className="text-primary">Más juegos de {product.sellerDisplayName}</h5>
                  <div className="muted mb-3">Vendedor: <strong style={{ color: "var(--text)" }}>{product.sellerDisplayName}</strong></div>

                  <SellerCard seller={seller} />

                  <div className="mt-3">
                    <h6 style={{ color: "var(--text)" }}>Otros títulos</h6>
                    <div className="row">
                      {sellerProducts.map(sp => (
                        <div key={sp.id} className="col-6 col-md-4 mb-2">
                          <Link to={`/product/${sp.id}`} onClick={() => window.scrollTo(0,0)} style={{ textDecoration: "none" }}>
                            <div className="card" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.03)" }}>
                              <img src={sp.primaryImageUrl} style={{ width: "100%", height: 120, objectFit: "cover" }} alt={sp.title} />
                              <div className="p-2">
                                <div style={{ color: "var(--text)", fontWeight: 700 }}>{sp.title}</div>
                                <div className="meta">{sp.platform}</div>
                                <div style={{ marginTop: 6, color: "var(--accent)", fontWeight: 700 }}>${sp.price}</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h5 className="text-primary">Opiniones de clientes</h5>
              <div className="mt-2">
                <ReviewList reviews={reviews} pageSize={3} />
              </div>
            </div>
          </div>

        <ActivationSteps />

        </div>
        <aside className="product-right">
          <div className="card shadow-sm p-3 mb-3">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: 0, color: "var(--text)" }}>{product.title}</h4>
              {product.bestDiscount && <div className="badge-off">{Math.round(product.bestDiscount.percentage * 100)}% OFF</div>}
            </div>

            <div className="meta mt-2">Plataforma: <strong style={{ color: "var(--text)" }}>{product.platform}</strong></div>
            <div className="meta">Región: <strong style={{ color: "var(--text)" }}>{product.region}</strong></div>

            <div className="d-flex align-items-center gap-3 mt-3">
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)" }}>${product.price}</div>
            </div>

            <div className="mt-3 d-grid gap-2">
              <Link className="btn btn-primary btn-lg" to="/cart" onClick={() => add(product)}>Comprar ahora</Link>
              <button className="btn btn-outline-primary" onClick={() => add(product)}>Agregar al carrito</button>
            </div>

            <div className="mt-3">
              <div className="meta">Stock: <strong style={{ color: "var(--text)" }}>{product.stock}</strong></div>
              <div className="meta">Vendidos: <strong style={{ color: "var(--text)" }}>{product.sold}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Vendedor</h6>
            <SellerCard seller={seller} />
          </div>

          <div className="card shadow-sm p-3">
            <h6 style={{ color: "var(--text)" }}>Productos relacionados</h6>
            <div style={{ marginTop: 8 }}>
              <RelatedProducts items={related} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
