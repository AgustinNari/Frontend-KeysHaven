import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import productsService from "../services/productsService";
import * as discountsService from "../services/discountsService";
import { useAuth } from "../context/AuthContext";

const CartContext = createContext(null);

const LS_KEY = "cart:v1";
const LS_COUPON = "cart:coupon:v1";

function normalizeProduct(p) {
  if (!p || (!p.id && !p.productId)) throw new Error("Producto inválido");
  return {
    id: p.id ?? p.productId,
    title: p.title ?? p.name ?? "Producto",
    price: Number(p.price ?? p._raw?.price ?? 0),
    currency: p.currency ?? p.moneda ?? "USD",
    imageUrl: p.primaryImageDataUrl ?? p.primaryImageUrl ?? p.imageUrl ?? p.image ?? p.imageURL ?? null,
    platform: p.platform ?? p.plataforma ?? null,
    region: p.region ?? p.región ?? null,
    sellerDisplayName: p.sellerDisplayName ?? p.seller ?? null,
    _raw: p._raw ?? p,
  };
}

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [couponState, setCouponState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_COUPON);
      return raw ? JSON.parse(raw) : { coupon: null, productId: null };
    } catch {
      return { coupon: null, productId: null };
    }
  });

  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(LS_COUPON, JSON.stringify(couponState));
  }, [couponState]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAuthenticated) {
        setAvailableCoupons([]);
        return;
      }
      try {
        const p = await discountsService.getActiveCouponsByBuyer(0, 200);
        if (cancelled) return;
        const list = p?.content ?? p ?? [];
        setAvailableCoupons(list);
      } catch (err) {
        console.warn("No se pudieron cargar cupones del usuario:", err);
        setAvailableCoupons([]);
      }
    })();
    return () => (cancelled = true);
  }, [isAuthenticated, user]);

  async function ensureProductDetail(raw) {
    if (!raw) return null;
    const pid = raw.id ?? raw.productId;
    if (!pid) return null;
    const sellerId = raw.sellerId ?? raw.seller?.id ?? raw.sellerId;
    const stock = raw.availableStock ?? raw.stock ?? raw._stock ?? raw.available_stock;
    if (sellerId != null && stock != null) {
      return { sellerId, stock: Number(stock) };
    }
    try {
      const p = await productsService.getById(pid);
      if (!p) return null;
      const resolvedStock = p.availableStock ?? p.stock ?? null;
      return { sellerId: p.sellerId ?? null, stock: resolvedStock == null ? null : Number(resolvedStock), detail: p };
    } catch (err) {
      console.warn("ensureProductDetail: error fetching product detail", err);
      return null;
    }
  }

  const add = useCallback(async (product, qty = 1) => {
    if (!isAuthenticated) {
      return { ok: false, reason: "Debes iniciar sesión para agregar al carrito" };
    }

    const np = normalizeProduct(product);
    qty = Number(qty) || 1;

    try {
      const info = await ensureProductDetail(np._raw);
      if (info?.sellerId != null && user && user.role === "SELLER" && Number(user.id) === Number(info.sellerId)) {
        console.warn("Un seller no puede comprar su propio producto");
        return { ok: false, reason: "No puedes comprar tu propio producto" };
      }
      if (info?.stock != null) {
        const existing = (items.find(x => String(x.id) === String(np.id)) || {}).qty || 0;
        if (existing + qty > info.stock) {
          console.warn("No hay suficiente stock para agregar esa cantidad");
          return { ok: false, reason: "Stock insuficiente" };
        }
      }
    } catch (e) {}

    setItems((prev) => {
      const idx = prev.findIndex((x) => String(x.id) === String(np.id));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty, _raw: np._raw };
        return next;
      }
      return [...prev, { ...np, qty }];
    });

    return { ok: true };
  }, [items, isAuthenticated, user]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
    setCouponState((s) =>
      s.productId && String(s.productId) === String(id)
        ? { coupon: null, productId: null }
        : s
    );
  }, []);

  const inc = useCallback(async (id) => {
    if (!isAuthenticated) {
      return { ok: false, reason: "Debes iniciar sesión para modificar el carrito" };
    }
    const it = items.find(x => String(x.id) === String(id));
    if (!it) return { ok: false, reason: "Item no encontrado" };
    try {
      const info = await ensureProductDetail(it._raw);
      if (info?.stock != null && it.qty + 1 > info.stock) {
        console.warn("No hay más stock disponible");
        return { ok: false, reason: "No hay más stock disponible" };
      }
      setItems((prev) =>
        prev.map((x) => (String(x.id) === String(id) ? { ...x, qty: x.qty + 1 } : x))
      );
      return { ok: true };
    } catch (err) {
      console.warn("Error incrementando cantidad", err);
      return { ok: false, reason: "Error" };
    }
  }, [items, isAuthenticated]);

  const dec = useCallback((id) => {
    setItems((prev) =>
      prev
        .map((x) =>
          String(x.id) === String(id) ? { ...x, qty: Math.max(0, x.qty - 1) } : x
        )
        .filter((x) => x.qty > 0)
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCouponState({ coupon: null, productId: null });
  }, []);

  const hasProductPercentDiscount = (it) => {
    try {
      const bd = it._raw?.bestDiscount;
      if (!bd) return false;
      const t = (bd.type ?? "").toString().toUpperCase();
      if (t !== "PERCENT") return false;
      const v = Number(bd.value ?? 0);
      return v > 0;
    } catch { return false; }
  };

  const priceBreakdown = useCallback(
    (it) => {
      const unitOriginal = Number(it._raw?.price ?? it.price ?? 0);
      const qty = Number(it.qty) || 0;
      const lineSubtotal = unitOriginal * qty;

      let productPercent = 0;
      if (it._raw?.bestDiscount && ((it._raw.bestDiscount.type ?? "").toString().toUpperCase() === "PERCENT")) {
        productPercent = Number(it._raw.bestDiscount.value ?? 0) || 0;
      }
      const productDiscountPerUnit = (unitOriginal * productPercent) / 100;
      const productDiscount = productDiscountPerUnit * qty;

      let couponDiscount = 0;
      let couponCode = null;
      if (couponState.coupon && Number(couponState.productId) === Number(it.id)) {
        couponCode = couponState.coupon.code;
        if (!hasProductPercentDiscount(it)) {
          couponDiscount = Number(couponState.coupon.discountAmount || 0);
          const maxAllowed = Math.max(0, lineSubtotal - productDiscount);
          couponDiscount = Math.min(Math.max(0, couponDiscount), maxAllowed);
        } else {
          couponDiscount = 0;
        }
      }

      const lineTotal = Math.max(0, lineSubtotal - productDiscount - couponDiscount);

      const unitFinal = Math.max(0, unitOriginal - productDiscountPerUnit);

      return {
        lineSubtotal,
        unitOriginal,
        unitFinal,
        productPercent,
        productDiscountPerUnit,
        productDiscount,
        couponCode,
        couponDiscount,
        lineTotal,
        currency: it.currency ?? "USD",
      };
    },
    [couponState]
  );

  const applyCouponByCode = useCallback(async (code, productId) => {
    if (!code) return { ok: false, reason: "Código vacío" };
    if (!isAuthenticated) return { ok: false, reason: "Debes iniciar sesión para usar cupones" };

    if (couponState.coupon && Number(couponState.productId) !== Number(productId)) {
      return { ok: false, reason: "Solo se permite 1 cupón por compra (ya hay otro aplicado)" };
    }

    const it = items.find(x => Number(x.id) === Number(productId));
    if (!it) return { ok: false, reason: "Item no encontrado en carrito" };

    if (hasProductPercentDiscount(it)) {
      return { ok: false, reason: "No se pueden aplicar cupones a productos que ya tienen descuento por producto." };
    }

    try {
      const requestItem = { productId: Number(it.id), quantity: Number(it.qty) };
      const resp = await discountsService.validateCouponForOrderItem(code, requestItem);
      if (!resp) return { ok: false, reason: "Respuesta inválida del servidor" };
      if (!resp.isValid) {
        return { ok: false, reason: resp.message || "Cupón inválido" };
      }
      const discountAmount = Number(resp.discountAmount || 0);
      setCouponState({
        coupon: { code: String(code).trim().toUpperCase(), discountAmount, discountId: resp.discountId ?? null },
        productId: Number(productId)
      });
      return { ok: true, discountAmount };
    } catch (err) {
      console.error("applyCouponByCode error", err);
      return { ok: false, reason: err.message || "Error al validar cupón" };
    }
  }, [items, isAuthenticated, couponState]);

  const removeCoupon = useCallback(
    () => setCouponState({ coupon: null, productId: null }),
    []
  );

  const summary = useMemo(() => {
    const count = items.reduce((n, it) => n + it.qty, 0);
    const subtotal = items.reduce(
      (n, it) => n + it.qty * (Number(it._raw?.price ?? it.price) || 0),
      0
    );

    let productDiscountTotal = 0;
    let couponDiscountTotal = 0;
    let total = 0;
    for (const it of items) {
      const b = priceBreakdown(it);
      productDiscountTotal += (b.productDiscount || 0);
      couponDiscountTotal += (b.couponDiscount || 0);
      total += b.lineTotal;
    }
    const discountTotal = productDiscountTotal + couponDiscountTotal;
    const currency = items[0]?.currency ?? "USD";
    return { count, subtotal, productDiscountTotal, couponDiscountTotal, discountTotal, total, currency };
  }, [items, priceBreakdown]);

  const value = useMemo(
    () => ({
      items,
      add,
      remove,
      inc,
      dec,
      clear,
      ...summary,
      appliedCoupon: couponState.coupon,
      couponTargetProductId: couponState.productId,
      applyCouponByCode,
      removeCoupon,
      priceBreakdown,
      availableCoupons,
      hasProductPercentDiscount,
    }),
    [
      items,
      add,
      remove,
      inc,
      dec,
      clear,
      summary,
      couponState,
      applyCouponByCode,
      removeCoupon,
      priceBreakdown,
      availableCoupons,
    ]
  );

  useEffect(() => {
    const api = {
      get items() {
        return items;
      },
      add,
      remove,
      inc,
      dec,
      clear,
      appliedCoupon: couponState.coupon,
      couponTargetProductId: couponState.productId,
    };
    window.cartAPI = api;

    const onAdd = (e) => {
      try {
        const { product, qty } = e.detail || {};
        if (product) add(product, qty ?? 1);
      } catch {}
    };
    document.addEventListener("cart:add", onAdd);

    return () => {
      document.removeEventListener("cart:add", onAdd);
      if (window.cartAPI === api) delete window.cartAPI;
    };
  }, [items, add, remove, inc, dec, clear, couponState]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
