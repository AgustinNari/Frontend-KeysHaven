import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import SellerCard from "../components/product/SellerCard";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import Rating from "../components/catalog/Rating";
import "../components/estilos/Fondos.css";
import "../components/estilos/product.css";
import ApiErrorAlert from "../components/common/ApiErrorAlert";
import useApiError from "../hooks/useApiError";

import { fetchSellerDetail, selectSellerDetail, selectSellerDetailProducts, fetchSellerActiveProductsForDetail } from "../redux/slices/sellersSlice";
import { fetchSellerStats } from "../redux/slices/sellerPanelSlice";

export default function SellerDetail() {
  const { sellerId } = useParams();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const { apiError, setFrom, clear, hasError } = useApiError();

  const sellerPublic = useAppSelector((s) => s.sellers.detail);
  const sellerStats = useAppSelector((s) => s.sellerPanel.stats);
  const activeProducts = useAppSelector(selectSellerDetailProducts);
  const sellersNeedsRefresh = useAppSelector((s) => s.sellers.needsRefresh);

  const sellerCacheEntry = useAppSelector(s => s.sellers?.detailCache?.[String(sellerId)]);
  const sellerProductsCacheEntry = useAppSelector(s => s.sellers?.detailProductsCache?.[String(sellerId)]);
  const sellerStatsCached = useAppSelector(s => s.sellerPanel?.stats && Number(s.sellerPanel.stats?.sellerId) === Number(sellerId) ? s.sellerPanel.stats : null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const seller = useMemo(() => {
    const stats = sellerStats || {};
    const pub = sellerPublic || {};
    return {
      id: pub.id ?? stats.id ?? sellerId,
      displayName: pub.displayName ?? stats.displayName ?? `Vendedor #${sellerId}`,
      sellerDescription: pub.sellerDescription ?? stats.sellerDescription ?? "",
      avatarDataUrl: pub.avatarDataUrl ?? stats.avatarDataUrl ?? null,
      firstName: pub.firstName ?? stats.firstName ?? "",
      lastName: pub.lastName ?? stats.lastName ?? "",
      email: pub.email ?? stats.email ?? "",
      phone: pub.phone ?? stats.phone ?? "",
      country: pub.country ?? stats.country ?? "",
      avgRating: pub.avgRating ?? stats.avgRating ?? 0,
      ratingCount: pub.ratingCount ?? stats.ratingCount ?? 0,
      soldKeys: pub.soldKeys ?? stats.soldKeys ?? stats.amountSold ?? 0,
      amountSold: stats.amountSold ?? pub.amountSold ?? 0,
      totalSales: stats.totalSales ?? 0,
      totalRevenue: stats.totalRevenue ?? 0,
      activeProducts: stats.activeProducts ?? 0,
      totalProducts: stats.totalProducts ?? (activeProducts?.length ?? 0)
    };
  }, [sellerPublic, sellerStats, sellerId, activeProducts]);

  useEffect(() => {
    if (!sellerId) return;
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        clear();

        const promises = [];

        if (!sellerCacheEntry || sellersNeedsRefresh) {
          promises.push(dispatch(fetchSellerDetail({ sellerId: Number(sellerId), force: !!sellersNeedsRefresh })));
        }

        if (!sellerStatsCached || sellersNeedsRefresh) {
          promises.push(dispatch(fetchSellerStats({ sellerId: Number(sellerId), force: !!sellersNeedsRefresh })));
        }

        if (!sellerProductsCacheEntry || sellersNeedsRefresh) {
          promises.push(dispatch(fetchSellerActiveProductsForDetail({ sellerId: Number(sellerId), force: !!sellersNeedsRefresh })));
        }

        await Promise.allSettled(promises);
      } catch (err) {
        console.error("Error cargando seller detail:", err);
        setFrom(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [sellerId, dispatch, clear, setFrom, sellerCacheEntry, sellerProductsCacheEntry, sellerStatsCached, sellersNeedsRefresh]);

  useEffect(() => {
    if (!sellerId) return;
    if (sellersNeedsRefresh) {
      dispatch(fetchSellerDetail({ sellerId: Number(sellerId), force: true }));
      dispatch(fetchSellerStats({ sellerId: Number(sellerId), force: true }));
      dispatch(fetchSellerActiveProductsForDetail({ sellerId: Number(sellerId), force: true }));
    }
  }, [sellersNeedsRefresh, sellerId, dispatch]);

  const handleRetry = () => {
    if (!sellerId) return;
    setLoading(true);
    clear();

    Promise.allSettled([
      dispatch(fetchSellerDetail({ sellerId: Number(sellerId), force: true })),
      dispatch(fetchSellerStats({ sellerId: Number(sellerId), force: true })),
      dispatch(fetchSellerActiveProductsForDetail({ sellerId: Number(sellerId), force: true }))
    ]).finally(() => setLoading(false));
  };

  const handleSetPage = (p) => setPage(p);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Cargando información del vendedor...</span>
      </div>
    );
  }

  if (hasError && !sellerPublic && !sellerStats) {
    return (
      <div className="container mt-4">
        <ApiErrorAlert error={apiError} onRetry={handleRetry} onClose={clear} />
      </div>
    );
  }

  if (!sellerPublic && !sellerStats) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">Vendedor no encontrado</div>
      </div>
    );
  }

  const totalItems = (activeProducts || []).length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = (activeProducts || []).slice(startIndex, endIndex);

  const displayName = seller.displayName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || `Vendedor #${sellerId}`;
  const avatar = seller.avatarDataUrl || "/src/assets/react.svg";
  const description = seller.sellerDescription || "-";
  const avgRating = seller.avgRating || 0;
  const ratingCount = seller.ratingCount || 0;
  const soldKeys = seller.soldKeys || 0;

  return (
    <div className="product-page">
      {hasError && (
        <div className="container mt-3">
          <ApiErrorAlert error={apiError} onRetry={handleRetry} onClose={clear} />
        </div>
      )}

      <div className="product-layout">
        <div className="product-left">
          <div className="card shadow-sm p-3 mb-3">
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <img
                src={avatar}
                alt={displayName}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 12,
                  objectFit: "cover",
                  backgroundColor: seller.avatarDataUrl ? "transparent" : "#f8f9fa"
                }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, color: "var(--text)" }}>{displayName}</h2>
                <div className="muted" style={{ marginTop: 6 }}>{description}</div>

                <div className="seller-stats" style={{ marginTop: 10, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div className="seller-stat" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Rating value={avgRating} count={ratingCount} size={16} />
                  </div>

                  <div className="seller-stat muted">
                    Ventas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-4">
            <h5 className="text-primary">Productos publicados</h5>

            {totalItems === 0 ? (
              <div className="muted mt-3">Este vendedor no tiene productos publicados.</div>
            ) : (
              <>
                <div className="mt-3">
                  <ProductGrid products={pageItems}/>
                </div>

                <div className="mt-3 d-flex justify-content-center">
                  <PaginationBar
                    page={safePage}
                    setPage={handleSetPage}
                    totalPages={totalPages}
                  />
                </div>

                <div className="meta mt-2 text-center" style={{ color: "var(--muted)" }}>
                  Mostrando {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems} productos
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="product-right">
          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Resumen del vendedor</h6>
            <div className="meta mt-2">
              <div>Rating: <strong style={{ color: "var(--text)" }}>{Number(avgRating/2).toFixed(1)}</strong></div>
              <div>Reseñas: <strong style={{ color: "var(--text)" }}>{ratingCount}</strong></div>
              <div>Keys vendidas: <strong style={{ color: "var(--text)" }}>{soldKeys.toLocaleString()}</strong></div>
            </div>
          </div>

          <div className="card shadow-sm p-3 mb-3">
            <h6 style={{ color: "var(--text)" }}>Información de contacto</h6>
            <div className="meta mt-2">
              {seller.email && <div>Email: <strong style={{ color: "var(--text)" }}>{seller.email}</strong></div>}
              {seller.country && <div>País: <strong style={{ color: "var(--text)" }}>{seller.country}</strong></div>}
            </div>
          </div>

          <div className="card shadow-sm p-3">
            <h6 style={{ color: "var(--text)" }}>Acciones</h6>
            <div className="d-grid gap-2 mt-2">
              <div className="muted" style={{ marginTop: 6 }}>
                Accede a la biblioteca de videojuegos de {displayName} desde el catálogo
              </div>

              <Link to={`/catalog?sellerId=${seller.id}`} className="btn btn-outline-primary">
                Ver en catálogo
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
