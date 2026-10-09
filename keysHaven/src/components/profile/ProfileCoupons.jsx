import { localizeErrorMessage } from '../../utils/displayText';
import React, { useEffect, useState, useRef, useCallback } from "react";
import PaginationBar from "../catalog/PaginationBar";
import productsService from "../../services/productsService";
import categoriesService from "../../services/categories";
import sellersService from "../../services/sellers";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchMyCoupons } from "../../redux/slices/profileSlice";
import { selectAllCategories, fetchAllCategories } from "../../redux/slices/categoriesSlice";

const DEFAULT_PAGE_SIZE = 9;
const COUPONS_TTL_MS = 10 * 60 * 1000;

function isStale(fetchedAt, ttl = COUPONS_TTL_MS) {
  if (!fetchedAt) return true;
  return (Date.now() - fetchedAt) > ttl;
}

export default function ProfileCoupons({ profile }) {
  const dispatch = useAppDispatch();
  const storedCategories = useAppSelector(selectAllCategories);

  const [page, setPage] = useState(0);
  const [size] = useState(DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [couponsPage, setCouponsPage] = useState({ items: [], totalPages: 1, totalElements: 0 });
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  const productMapRef = useRef({});
  const sellerMapRef = useRef({});
  const categoryMapRef = useRef({});

  useEffect(() => { dispatch(fetchAllCategories()); }, [dispatch]);
  useEffect(() => {
    categoryMapRef.current = storedCategories.reduce((acc, c) => {
      if (c?.id != null) acc[String(c.id)] = c;
      return acc;
    }, {});
  }, [storedCategories]);

  const loadCoupons = useCallback(async (p = 0) => {
    const state = dispatch((send, getState) => getState());
    const reduxCoupons = state.profile.coupons;
    const couponsFetchedAt = state.profile.couponsFetchedAt;
    const storedCategories = state.categories.all;
    setLoading(true);
    setError("");
    try {
      let itemsArr;
      if (Array.isArray(reduxCoupons) && !isStale(couponsFetchedAt)) {
        itemsArr = reduxCoupons;
      } else {
        const payload = await dispatch(fetchMyCoupons()).unwrap();
        itemsArr = payload?.content ?? payload ?? [];
      }

      const totalElements = Array.isArray(itemsArr) ? itemsArr.length : (itemsArr?.totalElements ?? 0);
      const totalPages = Math.max(1, Math.ceil(totalElements / size));

      const productIds = [...new Set((itemsArr || []).map(c => c.targetProductId).filter(Boolean))];
      const sellerIds = [...new Set((itemsArr || []).map(c => c.targetSellerId).filter(Boolean))];
      const categoryIds = [...new Set((itemsArr || []).map(c => c.targetCategoryId).filter(Boolean))];

      if ((!storedCategories || storedCategories.length === 0) && categoryIds.length > 0) {
        try {
          const cats = await categoriesService.getAllCategories();
          if (Array.isArray(cats)) {
            categoryMapRef.current = cats.reduce((acc, cat) => {
              if (cat?.id != null) acc[String(cat.id)] = cat;
              return acc;
            }, {});
          }
        } catch (catErr) {
          console.warn("No se pudieron cargar categorías:", catErr);
        }
      } else if (storedCategories && storedCategories.length > 0) {
        categoryMapRef.current = (storedCategories || []).reduce((acc, cat) => {
          if (cat?.id != null) acc[String(cat.id)] = cat;
          return acc;
        }, {});
      }

      await Promise.all(productIds.map(async (pid) => {
        const key = String(pid);
        if (productMapRef.current[key]) return;
        try {
          const prod = await productsService.getProductById(pid);
          if (prod && prod.id != null) productMapRef.current[key] = prod;
        } catch (err) {
          console.warn("Error cargando producto", pid, err);
          productMapRef.current[key] = null;
        }
      }));

      await Promise.all(sellerIds.map(async (sid) => {
        const key = String(sid);
        if (sellerMapRef.current[key]) return;
        try {
          const seller = await sellersService.getSellerDetail(sid);
          if (seller && seller.id != null) sellerMapRef.current[key] = seller;
        } catch (err) {
          console.warn("Error cargando seller", sid, err);
          sellerMapRef.current[key] = null;
        }
      }));

      const enhancedItems = (itemsArr || []).map(c => {
        const prod = c?.targetProductId ? productMapRef.current[String(c.targetProductId)] : null;
        const sellerObj = c?.targetSellerId ? sellerMapRef.current[String(c.targetSellerId)] : null;
        const sellerName = prod?.sellerDisplayName ?? sellerObj?.displayName ?? null;
        const productTitle = prod?.title ?? null;
        const categoryDesc = c?.targetCategoryId ? (categoryMapRef.current[String(c.targetCategoryId)]?.description ?? null) : null;
        return {
          ...c,
          _productTitle: productTitle,
          _categoryDesc: categoryDesc,
          _sellerName: sellerName
        };
      });

      const start = p * size;
      const pageItems = enhancedItems.slice(start, start + size);

      setCouponsPage({ items: pageItems, totalPages, totalElements });
    } catch (err) {
      console.error("Error cargando cupones:", err);
      setError("No se pudieron cargar los cupones. Intenta más tarde.");
      setCouponsPage({ items: [], totalPages: 1, totalElements: 0 });
    } finally {
      setLoading(false);
    }
  }, [dispatch, size]);

  useEffect(() => { loadCoupons(page); }, [page, loadCoupons]);

  const fixedCoupons = (couponsPage.items ?? []).filter(c => String(c.type ?? "").toUpperCase() === "FIXED");

  const buyerBalance = Number(profile?.buyerBalance ?? 0);
  const progressMod = buyerBalance % 100;
  const progressPercent = Math.round((progressMod / 100) * 100);
  const remaining = progressMod === 0 ? (buyerBalance === 0 ? 100 : 0) : Math.max(0, 100 - progressMod);
  const displayRemaining = remaining;

  const formatMoney = (v) => {
    if (v === null || typeof v === "undefined" || v === "") return "-";
    return `$${Number(v).toFixed(2)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.warn("Clipboard failed", err);
    }
  };

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header p-3 d-flex justify-content-between align-items-center" style={{ color: "var(--muted)" }}>
        <h5 className="mb-0">Mis Cupones</h5>
        <small style={{ color: "var(--muted)" }}>{couponsPage.totalElements ?? 0} disponibles</small>
      </div>

      <div className="card-body">
        <div className="mb-4 card bg-primary-mid border-0 border-secondary p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <small style={{ color: "var(--muted)" }}>Saldo acumulado</small>
              <div className="text-primary-light fw-bold" style={{ fontSize: 20 }}>{formatMoney(buyerBalance)}</div>
            </div>
            <div className="text-end">
              <small style={{ color: "var(--muted)" }}>Faltan</small>
              <div className="text-primary-light fw-bold" style={{ fontSize: 16 }}>
                {displayRemaining === 0 ? "¡Has alcanzado un tramo!" : `${formatMoney(displayRemaining)}`}
              </div>
            </div>
          </div>

          <div className="progress rounded-pill" style={{ height: 12, background: "rgba(255,255,255,0.04)" }}>
            <div
              className="progress-bar rounded-pill"
              role="progressbar"
              style={{
                width: `${progressPercent}%`,
                minWidth: 8,
                background: "linear-gradient(90deg,#7a5cff,#4fd1c5)"
              }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <div className="small mt-2" style={{ color: "var(--muted)" }}>
            <strong className="text-primary-light">{progressPercent}%</strong> hacia el próximo cupón (cada $100).
            {displayRemaining === 0 ? " Ya alcanzado." : ` Faltan ${formatMoney(displayRemaining)}.`}
          </div>
        </div>

        <div className="row g-3">
          {loading && (
            <div className="col-12 text-center py-4" style={{ color: "var(--muted)" }}>Cargando cupones...</div>
          )}

          {!loading && fixedCoupons.length === 0 && (
            <div className="col-12 text-center py-4" style={{ color: "var(--muted)" }}>No hay cupones asignados.</div>
          )}

          {!loading && fixedCoupons.map(c => (
            <div key={c.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-secondary" style={{ background: "linear-gradient(180deg, rgba(122,92,255,0.06), rgba(79,209,197,0.03))" }}>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="small" style={{ color: "var(--muted)" }}>Código</div>
                      <div className="font-monospace fw-bold" style={{ color: "var(--accent)", letterSpacing: 1.2, fontSize: 18 }}>{c.code ?? "-"}</div>
                    </div>
                    <div className="text-end">
                      <div className="small" style={{ color: "var(--muted)" }}>Valor</div>
                      <div className="fw-bold" style={{ fontSize: 16 }}>{formatMoney(c.value)}</div>
                    </div>
                  </div>

                  {(c._categoryDesc || c._productTitle || c._sellerName) && (
                    <div className="mb-2" style={{ flexGrow: 1 }}>
                      <div className="small" style={{ color: "var(--muted)" }}>Aplica a</div>
                      <div className="small" style={{ color: "#a85ef1ff" }}>
                        {c._categoryDesc && <span className="me-2">Categoría: <strong>{c._categoryDesc}</strong></span>}
                        {c._productTitle && (
                          <div>Producto: <strong>{c._productTitle}</strong></div>
                        )}
                        {c._productTitle && c._sellerName && (
                          <div>Vendido por: <strong>{c._sellerName}</strong></div>
                        )}
                        {c._sellerName && !c._productTitle && (
                          <div>Vendedor: <strong>{c._sellerName}</strong></div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-2" style={{ marginTop: "auto" }}>
                    <div className="small" style={{ color: "var(--muted)" }}>Válido hasta</div>
                    <div className="text-primary-light">{c.endsAt ? new Date(c.endsAt).toLocaleDateString() : "Sin límite"}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <div className="small" style={{ color: "var(--muted)" }}>Rango válido</div>
                      <div className="small" style={{ color: "#a85ef1ff" }}>{c.minPrice ? formatMoney(c.minPrice) : "-"} / {c.maxPrice ? formatMoney(c.maxPrice) : "-"}</div>
                    </div>

                    <div className="text-end">
                      <div className="mb-2">
                        <span className={`badge ${c.active ? 'bg-success' : 'bg-danger'}`}>{c.active ? 'Activo' : 'Inactivo'}</span>
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-light" onClick={() => copyToClipboard(c.code)}>
                          {copiedCode === c.code ? "Copiado ✓" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center mt-4">
          <div>
            <PaginationBar
              page={Math.min(Math.max(1, page + 1), couponsPage.totalPages || 1)}
              setPage={(p1) => {
                const newPage = Math.max(1, Math.min(p1, couponsPage.totalPages || 1)) - 1;
                setPage(newPage);
              }}
              totalPages={couponsPage.totalPages || 1}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{localizeErrorMessage(error)}</div>}
      </div>
    </div>
  );
}
