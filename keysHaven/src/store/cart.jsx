import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { COUPONS } from "../data/coupons.js";

const CartContext = createContext(null);

const LS_KEY = "cart:v1";
const LS_COUPON = "cart:coupon:v1";

function normalizeProduct(p) {
  if (!p || (!p.id && !p.productId)) throw new Error("Producto inválido");
  return {
    id: p.id ?? p.productId,
    title: p.title ?? p.name ?? "Producto",
    price: Number(p.price ?? 0),
    currency: p.currency ?? p.moneda ?? "USD",
    imageUrl: p.primaryImageUrl ?? p.imageUrl ?? p.image ?? p.imageURL ?? null,
    platform: p.platform ?? p.plataforma ?? null,
    region: p.region ?? p.región ?? null,
    sellerDisplayName: p.sellerDisplayName ?? p.seller ?? null,
    _raw: p, 
  };
}

export function CartProvider({ children }) {
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

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(LS_COUPON, JSON.stringify(couponState));
  }, [couponState]);

  const add = useCallback((product, qty = 1) => {
    const np = normalizeProduct(product);
    qty = Number(qty) || 1;

    setItems((prev) => {
      const idx = prev.findIndex((x) => String(x.id) === String(np.id));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...np, qty }];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
    setCouponState((s) =>
      s.productId && String(s.productId) === String(id)
        ? { coupon: null, productId: null }
        : s
    );
  }, []);

  const inc = useCallback((id) => {
    setItems((prev) =>
      prev.map((x) => (String(x.id) === String(id) ? { ...x, qty: x.qty + 1 } : x))
    );
  }, []);

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
  const bestBulkPercentFor = (it) => {
    const rules = it._raw?.bulkPricing ?? [];
    if (!Array.isArray(rules) || !rules.length) return 0;
    let best = 0;
    for (const r of rules) {
      const min = Number(r.minQty ?? 0);
      const p = Number(r.percentOff ?? 0);
      if (it.qty >= min) best = Math.max(best, p);
    }
    return best;
  };

  const isCouponApplicableTo = (coupon, productId) => {
    if (!coupon || !productId) return false;
    if (!coupon.active) return false;
    if (
      Array.isArray(coupon.productIds) &&
      !coupon.productIds.includes(Number(productId))
    )
      return false;
    return items.some((x) => Number(x.id) === Number(productId));
  };

  const applyCouponByCode = useCallback(
    (code, productId) => {
      const clean = String(code || "").trim().toUpperCase();
      const c = COUPONS.find((x) => x.code.toUpperCase() === clean && x.active);
      if (!c) return { ok: false, reason: "Código inválido" };
      if (couponState.coupon) return { ok: false, reason: "Ya hay un cupón aplicado" };
      if (!isCouponApplicableTo(c, productId))
        return { ok: false, reason: "No aplica a ese producto" };
      setCouponState({ coupon: c, productId });
      return { ok: true };
    },
    [couponState.coupon, items]
  );

  const removeCoupon = useCallback(
    () => setCouponState({ coupon: null, productId: null }),
    []
  );

  const priceBreakdown = useCallback(
    (it) => {
      const unit = Number(it.price) || 0;
      const qty = Number(it.qty) || 0;
      const lineSubtotal = unit * qty;

     
      const bulkPercent = bestBulkPercentFor(it);
      const bulkDiscount = (lineSubtotal * bulkPercent) / 100;

      
      let couponDiscount = 0;
      let couponCode = null;
      if (couponState.coupon && Number(couponState.productId) === Number(it.id)) {
        couponCode = couponState.coupon.code;
        const base = lineSubtotal - bulkDiscount;
        if (couponState.coupon.type === "percent") {
          couponDiscount = (base * Number(couponState.coupon.value || 0)) / 100;
        } else {
          couponDiscount = Math.min(base, Number(couponState.coupon.value || 0));
        }
      }

      const lineTotal = Math.max(0, lineSubtotal - bulkDiscount - couponDiscount);

      return {
        lineSubtotal,
        bulkPercent,
        bulkDiscount,
        couponCode,
        couponDiscount,
        lineTotal,
        currency: it.currency ?? "USD",
      };
    },
    [couponState]
  );

  const summary = useMemo(() => {
    const count = items.reduce((n, it) => n + it.qty, 0);
    const subtotal = items.reduce(
      (n, it) => n + it.qty * (Number(it.price) || 0),
      0
    );
    let discountTotal = 0;
    let total = 0;
    for (const it of items) {
      const b = priceBreakdown(it);
      discountTotal += (b.bulkDiscount || 0) + (b.couponDiscount || 0);
      total += b.lineTotal;
    }
    const currency = items[0]?.currency ?? "USD";
    return { count, subtotal, discountTotal, total, currency };
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
