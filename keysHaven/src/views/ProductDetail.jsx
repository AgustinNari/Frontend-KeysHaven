import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../store/cart.jsx";
import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";
import ActivationSteps from "../components/product/ActivationSteps.jsx";

import ImageCarousel from "../components/product/ImageCarousel";
import SellerCard from "../components/product/SellerCard";
import RelatedProducts from "../components/product/RelatedProducts";
import ReviewList from "../components/product/ReviewList";
import Rating from "../components/catalog/Rating";

import productsService from "../services/productsService.js";
import sellersService from "../services/sellers";
import reviewsService from "../services/reviews";

export default function ProductDetail() {
  const { id } = useParams();
  const { add } = useCart();

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [reviewsPage, setReviewsPage] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("descripcion");

  const [reviewsPageNumber, setReviewsPageNumber] = useState(1);
  const reviewsPageSize = 5;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const detail = await productsService.getById(id);
        if (!detail) {
          setProduct(null);
          return;
        }

        setProduct(detail);

        const imgs = (detail.images || []).slice().sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return (a.name || "").localeCompare(b.name || "");
        });
        setProductImages(imgs);
        setActiveImageIndex(0);

        if (detail.sellerId) {
          try {
            const s = await sellersService.getSellerDetail(detail.sellerId);
            setSeller(s);
          } catch (e) {
            setSeller(null);
          }
        } else {
          setSeller(null);
        }

        const categoryIds = (detail.categories || []).map(c => (c?.id ?? null)).filter(Boolean);
        if (categoryIds.length > 0) {
          const rel = await productsService.relatedByCategories(categoryIds, detail.id, 6);
          setRelated(rel);
        } else {
          setRelated([]);
        }

        if (detail.sellerId) {
          const sp = await productsService.productsBySeller(detail.sellerId, detail.id, 6);
          setSellerProducts(sp);
        } else {
          setSellerProducts([]);
        }

        const r = await reviewsService.getReviewsByProduct(id, 0, reviewsPageSize);
        setReviewsPage({
          content: r?.content ?? [],
          totalElements: r?.totalElements ?? r?.total ?? 0,
          totalPages: r?.totalPages ?? Math.max(1, Math.ceil((r?.totalElements ?? r?.total ?? 0) / reviewsPageSize))
        });
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
        window.scrollTo(0,0);
      }
    };

    fetchDetail();
  }, [id]);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const r = await reviewsService.getReviewsByProduct(id, reviewsPageNumber - 1, reviewsPageSize);
        setReviewsPage({
          content: r?.content ?? [],
          totalElements: r?.totalElements ?? r?.total ?? 0,
          totalPages: r?.totalPages ?? Math.max(1, Math.ceil((r?.totalElements ?? r?.total ?? 0) / reviewsPageSize))
        });
      } catch (e) {
        console.error("Error loading reviews page", e);
      }
    };
    if (product) fetchReviews();
  }, [id, reviewsPageNumber, reviewsPageSize, product]);

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

  let discountPctDisplay = null;
  let discountedPrice = null;
  let fixedOffAmount = null;
  if (product.bestDiscount != null) {
    if (product.bestDiscountFrac != null) {
      discountPctDisplay = Math.round(product.bestDiscountFrac * 100);
      discountedPrice = product.discountedPrice ?? null;
    } else if (product.bestDiscount.type === "FIXED" && product.bestDiscount.value != null) {
      fixedOffAmount = Number(product.bestDiscount.value);
      discountedPrice = product.discountedPrice ?? null;
    } else if (product.bestDiscount.value != null) {
      const frac = (Number(product.bestDiscount.value) > 1) ? Number(product.bestDiscount.value) / 100 : Number(product.bestDiscount.value);
      if (!Number.isNaN(frac)) {
        discountPctDisplay = Math.round(frac * 100);
        discountedPrice = Math.max(0, Math.round((Number(product.price ?? 0) * (1 - frac)) * 100) / 100);
      }
    }
  }

  const basePrice = Number(product.price ?? 0);
  const priceToShow = discountedPrice != null ? discountedPrice : basePrice;

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
              <div className="stat"><strong style={{ color: "var(--text)" }}>${priceToShow.toFixed(2)}</strong></div>
              <div className="stat"><Rating value={product.avgRating ?? 0} count={product.ratingCount ?? 0} size={14} /></div>
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
                  <p className="muted">Categorías: <strong style={{ color: "var(--text)" }}>{(product.categories || []).map(c => c?.description ?? "").join(", ")}</strong></p>
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
                              <img src={sp.primaryImageDataUrl ?? sp.primaryImageUrl} style={{ width: "100%", height: 120, objectFit: "cover" }} alt={sp.title} />
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
                <ReviewList
                  reviews={reviewsPage.content}
                  page={reviewsPageNumber}
                  setPage={setReviewsPageNumber}
                  totalPages={reviewsPage.totalPages}
                  pageSize={reviewsPageSize}
                />
              </div>
            </div>
          </div>

        <ActivationSteps />

        </div>

        <aside className="product-right">
          <div className="card shadow-sm p-3 mb-3">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h4 style={{ margin: 0, color: "var(--text)" }}>{product.title}</h4>
              {discountPctDisplay != null ? (
                <div className="badge-off">{discountPctDisplay}% OFF</div>
              ) : (fixedOffAmount != null ? (
                <div className="badge-off">${Number(fixedOffAmount).toFixed(2)} OFF</div>
              ) : null)}
            </div>

            <div className="meta mt-2">Plataforma: <strong style={{ color: "var(--text)" }}>{product.platform}</strong></div>
            <div className="meta">Región: <strong style={{ color: "var(--text)" }}>{product.region}</strong></div>

            <div className="d-flex align-items-center gap-3 mt-3">
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent)" }}>${priceToShow.toFixed(2)}</div>
              {discountedPrice != null && (
                <div style={{ marginLeft: 8, textDecoration: "line-through", color: "rgba(255,255,255,0.6)" }}>
                  ${basePrice.toFixed(2)}
                </div>
              )}
            </div>

            <div className="mt-3 d-grid gap-2">
              <button className="btn btn-primary btn-lg" onClick={() => add({
                id: product.id,
                title: product.title,
                price: priceToShow,
                imageUrl: product.primaryImageDataUrl ?? (product.primaryImageUrl ?? null),
                platform: product.platform,
                region: product.region
              })}>Comprar ahora</button>

              <button className="btn btn-outline-primary" onClick={() => add({
                id: product.id,
                title: product.title,
                price: priceToShow,
                imageUrl: product.primaryImageDataUrl ?? (product.primaryImageUrl ?? null),
                platform: product.platform,
                region: product.region
              })}>Agregar al carrito</button>
            </div>

            <div className="mt-3">
              <div className="meta">Stock: <strong style={{ color: "var(--text)" }}>{product.stock}</strong></div>
              <div className="meta">Vendidos: <strong style={{ color: "var(--text)" }}>{product.sold}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Vendedor</h6>
            <SellerCard seller={seller} />
            <div className="mt-2">
              <Link to={`/seller-detail/${product.sellerId}`} className="btn btn-outline-primary btn-sm">Ver vendedor</Link>
            </div>
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
