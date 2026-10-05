import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "../store/cart.jsx";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectUser } from "../redux/slices/authSlice";
import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";
import ActivationSteps from "../components/product/ActivationSteps.jsx";
import ImageCarousel from "../components/product/ImageCarousel";
import SellerCard from "../components/product/SellerCard";
import RelatedProducts from "../components/product/RelatedProducts";
import ReviewList from "../components/product/ReviewList";
import Rating from "../components/catalog/Rating";

import {
  fetchProductDetail,
  fetchRelatedProducts,
  fetchProductReviews,
  upsertProductDetail,
  setReviewsFromCache,
  setRelatedFromCache,
  selectProductReviewsPages,

  selectRelatedCache
} from "../redux/slices/productDetailSlice";

import {
  fetchSellerDetail,

  fetchSellerActiveProductsForDetail,
  selectSellerDetailProducts
} from "../redux/slices/sellersSlice";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { add } = useCart();
  const user = useAppSelector(selectUser);

  const product = useAppSelector((s) => s.productDetail.product);
  const productLoading = useAppSelector((s) => s.productDetail.loading);
  const related = useAppSelector((s) => s.productDetail.related || []);
  const reviewsFromSlice = useAppSelector((s) => s.productDetail.reviews || []);
  const sellersDetail = useAppSelector((s) => s.sellers.detail);
  const sellerDetailProducts = useAppSelector(selectSellerDetailProducts);
  const sellersNeedsRefresh = useAppSelector((s) => s.sellers.needsRefresh);

  const productCacheEntry = useAppSelector(s => s.productDetail?.productCache?.[String(id)]);
  const reviewsPages = useAppSelector(selectProductReviewsPages);
  const relatedCache = useAppSelector(selectRelatedCache);

  const sellerCacheEntry = useAppSelector(s => s.sellers?.detailCache?.[String(product?.sellerId)]);
  const sellerProductsCacheEntry = useAppSelector(s => s.sellers?.detailProductsCache?.[String(product?.sellerId)]);

  const requestedRef = useRef({
    productId: null,
    reviewsKeys: new Set(),
    relatedKeys: new Set()
  });

  useEffect(() => {
    requestedRef.current = { productId: null, reviewsKeys: new Set(), relatedKeys: new Set() };
  }, [id]);

  const [productImages, setProductImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("descripcion");
  const [reviewsPageNumber, setReviewsPageNumber] = useState(1);
  const reviewsPageSize = 5;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const load = async () => {
      try {
        if (productCacheEntry && !sellersNeedsRefresh) {
          if (!product || Number(product.id) !== Number(id)) {
            dispatch(upsertProductDetail(productCacheEntry));
          }
        } else {
          if (String(requestedRef.current.productId) !== String(id)) {
            requestedRef.current.productId = id;
            await dispatch(fetchProductDetail({ productId: Number(id) })).unwrap();
          }
        }

        const initialReviewsKey = `${String(id)}_0_${reviewsPageSize}`;
        if (reviewsPages && reviewsPages[initialReviewsKey]) {
          dispatch(setReviewsFromCache(initialReviewsKey));
        } else {
          if (!requestedRef.current.reviewsKeys.has(initialReviewsKey)) {
            requestedRef.current.reviewsKeys.add(initialReviewsKey);
            await dispatch(fetchProductReviews({ productId: Number(id), page: 0, size: reviewsPageSize })).unwrap();
          }
        }
      } catch (err) {
        console.error("ProductDetail load error:", err);
      } finally {
        if (mounted) window.scrollTo(0, 0);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id, dispatch, product, productCacheEntry, reviewsPages, sellersNeedsRefresh]);

  useEffect(() => {
    if (!product) {
      setProductImages([]);
      return;
    }

    const imgs = (product.images || []).slice().sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });
    setProductImages(imgs);
    setActiveImageIndex(0);

    const categoryIds = (product.categories || []).map(c => (c?.id ?? null)).filter(Boolean);
    if (categoryIds.length > 0) {
      const relatedKey = `${String(product.id ?? 'none')}_${categoryIds.join(',')}_6`;
      if (relatedCache && relatedCache[relatedKey]) {
        dispatch(setRelatedFromCache(relatedKey));
      } else {
        if (!requestedRef.current.relatedKeys.has(relatedKey)) {
          requestedRef.current.relatedKeys.add(relatedKey);
          dispatch(fetchRelatedProducts({ categoryIds, excludeProductId: product.id, size: 6 }));
        }
      }
    }

    if (product.sellerId) {
      if (!sellerCacheEntry || sellersNeedsRefresh) {
        dispatch(fetchSellerDetail({ sellerId: product.sellerId }));
      }
      if (!sellerProductsCacheEntry || sellersNeedsRefresh) {
        dispatch(fetchSellerActiveProductsForDetail({ sellerId: product.sellerId }));
      }
    }
  }, [product, dispatch, sellersNeedsRefresh, sellerCacheEntry, sellerProductsCacheEntry, relatedCache]);

  useEffect(() => {
    if (!product) return;
    if (sellersNeedsRefresh && product.sellerId) {
      dispatch(fetchSellerDetail({ sellerId: product.sellerId, force: true }));
      dispatch(fetchProductDetail({ productId: product.id, force: true }));
      dispatch(fetchSellerActiveProductsForDetail({ sellerId: product.sellerId, force: true }));
      requestedRef.current = { productId: null, reviewsKeys: new Set(), relatedKeys: new Set() };
    }
  }, [sellersNeedsRefresh, product, dispatch]);

  useEffect(() => {
    if (!product) return;
    const page = Math.max(0, reviewsPageNumber - 1);
    const key = `${String(product.id)}_${page}_${reviewsPageSize}`;
    const loadPage = async () => {
      try {
        if (reviewsPages && reviewsPages[key]) {
          dispatch(setReviewsFromCache(key));
        } else {
          if (!requestedRef.current.reviewsKeys.has(key)) {
            requestedRef.current.reviewsKeys.add(key);
            await dispatch(fetchProductReviews({ productId: product.id, page, size: reviewsPageSize })).unwrap();
          }
        }
      } catch (err) {
        console.error("Error loading reviews page:", err);
      }
    };
    loadPage();
  }, [reviewsPageNumber, product, dispatch, reviewsPages, reviewsPageSize]);

  const sellerPanelProducts = useAppSelector((s) => s.sellerPanel.products || []);
  useEffect(() => {
    if (!product) return;
    const found = sellerPanelProducts.find(p => Number(p.id) === Number(product.id));
    if (found) {
      dispatch(upsertProductDetail(found));
    }
  }, [sellerPanelProducts, product, dispatch]);

  const showToast = (text, type = "warn", duration = 2600) => {
    setToast({ text, type });
    setTimeout(() => setToast(null), duration);
  };

  const blockedPurchase = useMemo(() => {
    const isAdmin = user?.role === "ADMIN";
    const isSellerOwner = user?.role === "SELLER" && String(user?.id) === String(product?.sellerId);
    return isAdmin || isSellerOwner;
  }, [user, product]);

  const buildAddPayload = () => {
    const basePrice = Number(product?.price ?? 0);
    return {
      id: product.id,
      title: product.title,
      price: basePrice,
      currency: product.currency ?? "USD",
      imageUrl: product.primaryImageDataUrl ?? product.primaryImageUrl ?? (product.images && product.images.length ? (product.images[0].dataUrl ?? product.images[0].file) : null),
      platform: product.platform,
      region: product.region,
      _raw: {
        id: product.id,
        price: basePrice,
        bestDiscount: product.bestDiscount ?? null,
        primaryImageDataUrl: product.primaryImageDataUrl ?? product.primaryImageUrl ?? null,
        availableStock: product.availableStock ?? product.stock ?? null
      }
    };
  };

  const handleAddToCart = async () => {
    if (blockedPurchase) {
      showToast(product?.sellerId && user?.role === "SELLER" ? "No se pueden comprar productos propios" : "El administrador no puede comprar", "warn");
      return;
    }
    const res = await add(buildAddPayload(), Number(product.minPurchaseQuantity ?? 1));
    if (!res || !res.ok) showToast(res?.reason ?? "No se pudo agregar al carrito", "warn");
    else showToast("Añadido al carrito", "info");
  };

  const handleBuyNow = async () => {
    if (blockedPurchase) {
      showToast(product?.sellerId && user?.role === "SELLER" ? "No se pueden comprar productos propios" : "El administrador no puede comprar", "warn");
      return;
    }
    const res = await add(buildAddPayload(), Number(product.minPurchaseQuantity ?? 1));
    if (!res || !res.ok) {
      showToast(res?.reason ?? "No se pudo agregar al carrito", "warn");
      return;
    }
    navigate("/cart");
  };

  if (productLoading) {
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

  const productHasPercent = product.bestDiscount != null && (String(product.bestDiscount.type ?? "").toUpperCase() === "PERCENT") && Number(product.bestDiscount.value ?? 0) > 0;

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
    <div className="product-page" style={{ position: "relative" }}>
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
              <div className="stat muted">Lanzamiento: <strong style={{ color: "var(--text)" }}>{product.releaseDate ?? "N/A"}</strong></div>
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

                  <SellerCard seller={sellersDetail || { displayName: product.sellerDisplayName, id: product.sellerId }} />

                  <div className="mt-3">
                    <h6 style={{ color: "var(--text)" }}>Otros títulos</h6>
                    <div className="row">
                      {(sellerDetailProducts || []).slice(0, 6).map(sp => (
                        <div key={sp.id} className="col-6 col-md-4 mb-2">
                          <Link to={`/product/${sp.id}`} onClick={() => window.scrollTo(0,0)} style={{ textDecoration: "none" }}>
                            <div className="card" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.03)" }}>
                              <img src={sp.primaryImageDataUrl ?? sp.primaryImageUrl} style={{ width: "100%", height: 120, objectFit: "cover" }} alt={sp.title} />
                              <div className="p-2">
                                <div style={{ color: "var(--text)", fontWeight: 700 }}>{sp.title}</div>
                                <div className="meta">{sp.platform}</div>
                                <div style={{ marginTop: 6, color: "var(--accent)", fontWeight: 700 }}>${sp.price - (sp.bestDiscountPercentage* sp.price * 0.01)}</div>
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
                  reviews={reviewsFromSlice}
                  page={reviewsPageNumber}
                  setPage={setReviewsPageNumber}
                  totalPages={Math.max(1, Math.ceil(((product.ratingCount ?? 0) / reviewsPageSize)))}
                  pageSize={reviewsPageSize}
                />
              </div>
            </div>
          </div>

          <ActivationSteps platform={product.platform} region={product.region} />
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

            {productHasPercent && (
              <div className="mt-2 mb-1">
                <small style={{ color: "var(--accent-strong)" }}>
                  Este producto ya tiene un <strong>descuento por producto</strong>. No se podrán aplicar cupones adicionales sobre este ítem.
                </small>
              </div>
            )}

            <div className="mt-3 d-grid gap-2">
              <button
                className={`btn btn-lg ${blockedPurchase ? "btn-secondary" : "btn-primary"}`}
                onClick={handleBuyNow}
                aria-disabled={blockedPurchase}
                title={blockedPurchase ? (user?.role === "ADMIN" ? "Administrador: no puede comprar" : "No puedes comprar tus propios productos") : "Comprar ahora"}
              >
                Comprar ahora
              </button>

              <button
                className={`btn ${blockedPurchase ? "btn-outline-secondary" : "btn-outline-primary"}`}
                onClick={handleAddToCart}
                aria-disabled={blockedPurchase}
                title={blockedPurchase ? (user?.role === "ADMIN" ? "Administrador: no puede comprar" : "No puedes comprar tus propios productos") : "Agregar al carrito"}
              >
                Agregar al carrito
              </button>
            </div>

            <div className="mt-3">
              <div className="meta">Stock: <strong style={{ color: "var(--text)" }}>{product.stock}</strong></div>
              <div className="meta">Vendidos: <strong style={{ color: "var(--text)" }}>{product.sold}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Vendedor</h6>
            <SellerCard seller={sellersDetail || { displayName: product.sellerDisplayName, id: product.sellerId }} />
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

      {toast && (
        <div style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 5000,
          minWidth: 220
        }}>
          <div className={`alert ${toast.type === "warn" ? "alert-warning" : "alert-info"} py-2 mb-0`} role="alert">
            <small style={{ fontWeight: 600 }}>{toast.text}</small>
          </div>
        </div>
      )}
    </div>
  );
}
