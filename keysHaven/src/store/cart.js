import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from "react";

const CartContext = createContext(null);
const LS_KEY = "cart:v1";

function normalizeProduct(p) {
  if (!p || (!p.id && !p.productId)) throw new Error("Producto inválido");
  return {
    id: p.id ?? p.productId,
    title: p.title ?? p.name ?? "Producto",
    price: Number(p.price ?? 0),
    currency: p.currency ?? p.moneda ?? "USD",
    imageUrl: p.imageUrl ?? p.image ?? p.imageURL ?? null,
    platform: p.platform ?? p.plataforma ?? null,
    region: p.region ?? p.región ?? null,
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

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

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

  const clear = useCallback(() => setItems([]), []);

  // Totales derivados
  const summary = useMemo(() => {
    const count = items.reduce((n, it) => n + it.qty, 0);
    const subtotal = items.reduce((n, it) => n + it.qty * (Number(it.price) || 0), 0);
    const currency = items[0]?.currency ?? "USD";
    return { count, subtotal, currency };
  }, [items]);

  const value = useMemo(
    () => ({ items, add, remove, inc, dec, clear, ...summary }),
    [items, add, remove, inc, dec, clear, summary]
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
  }, [items, add, remove, inc, dec, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
