import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import productsService from "../services/productsService";
import apiClient from "../api/apiClient";
import * as discountsService from "../services/discountsService";
import {
  addOrUpdateItem,
  removeItem as removeItemAction,
  replaceItem,
  setItemQty,
  clearCart as clearCartAction,
  setCoupon,
  clearCoupon,
  setAvailableCoupons,
  selectCartItems,
  selectCartCoupon,
  selectCartCouponProductId,
  selectCartAvailableCoupons
} from "../redux/slices/cartSlice";
import { selectUser, selectIsAuthenticated } from "../redux/slices/authSlice";

function normalizeProduct(p) {
  if (!p || (!p.id && !p.productId)) throw new Error("Producto inválido");
  return {
    id: p.id ?? p.productId,
    title: p.title ?? p.name ?? "Producto",
    price: Number(p.price ?? p._raw?.price ?? 0),
    currency: p.currency ?? p.moneda ?? "USD",
    imageUrl:
      p.primaryImageDataUrl ??
      p.primaryImageUrl ??
      p.imageUrl ??
      p.image ??
      p.imageURL ??
      null,
    platform: p.platform ?? p.plataforma ?? null,
    region: p.region ?? p.región ?? null,
    sellerDisplayName: p.sellerDisplayName ?? p.seller ?? null,
    _raw: p._raw ?? p
  };
}

async function ensureProductDetail(raw, quantity = 1) {
  if (!raw) return null;
  const pid = raw.id ?? raw.productId;
  if (!pid) return null;
  const p = await productsService.getById(pid);
  if (!p) throw new Error('No se pudo comprobar el producto');
  const bestDiscount = await apiClient.apiFetch(`/discounts/product/${pid}?quantity=${quantity}`);
  return { sellerId: p.sellerId, stock: Number(p.availableStock ?? p.stock ?? 0), detail: { ...p, bestDiscount } };

}

function productPercent(it) {
  const d = it._raw?.bestDiscount ?? it.bestDiscount;
  const qty = Number(it.qty);
  const now = Date.now();
  if (!d || d.active === false || d.type !== 'PERCENT' ||
    (d.minQuantity != null && qty < d.minQuantity) || (d.maxQuantity != null && qty > d.maxQuantity) ||
    (d.startsAt && new Date(d.startsAt).getTime() > now) ||
    (d.endsAt && new Date(d.endsAt).getTime() <= now) ||
    (d.expiresAt && new Date(d.expiresAt).getTime() <= now)) return 0;
  return Math.min(100, Math.max(0, Number(d.value) || 0));
}

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const coupon = useAppSelector(selectCartCoupon);
  const couponProductId = useAppSelector(selectCartCouponProductId);
  const availableCoupons = useAppSelector(selectCartAvailableCoupons);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const hasProductPercentDiscount = useCallback(it => productPercent(it) > 0, []);

  const priceBreakdown = useCallback((it) => {
    const unitOriginal = Number(it._raw?.price ?? it.price ?? 0);
    const qty = Number(it.qty) || 0;
    const lineSubtotal = unitOriginal * qty;

    const percent = productPercent(it);
    const productDiscountPerUnit = (unitOriginal * percent) / 100;
    const productDiscount = Math.round((productDiscountPerUnit * qty + Number.EPSILON) * 100) / 100;

    let couponDiscount = 0;
    let couponCode = null;
    if (coupon && Number(couponProductId) === Number(it.id)) {
      couponCode = coupon.code;
      if (!hasProductPercentDiscount(it)) {
        couponDiscount = Number(coupon.discountAmount || 0);
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
      productPercent: percent,
      productDiscountPerUnit,
      productDiscount,
      couponCode,
      couponDiscount,
      lineTotal,
      currency: it.currency ?? "USD",
    };
  }, [coupon, couponProductId, hasProductPercentDiscount]);

  const summary = useMemo(() => {
    const count = items.reduce((n, it) => n + it.qty, 0);
    const subtotal = items.reduce((n, it) => n + it.qty * (Number(it._raw?.price ?? it.price) || 0), 0);
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

  const add = useCallback(async (product, qty = 1) => {
    if (!isAuthenticated) {
      return { ok: false, reason: "Debes iniciar sesión para agregar al carrito" };
    }

    const np = normalizeProduct(product);
    qty = Number(qty);
    if (!Number.isInteger(qty) || qty <= 0) return { ok: false, reason: 'La cantidad debe ser un entero positivo' };

    try {
      const existingQty = items.find(item => String(item.id) === String(np.id))?.qty ?? 0;
      const info = await ensureProductDetail(np._raw, existingQty + qty);
      if (info?.sellerId != null && user && Number(user.id) === Number(info.sellerId)) {
        return { ok: false, reason: "No puedes comprar tu propio producto" };
      }
      if (info?.detail?.active === false) return { ok: false, reason: 'Producto inactivo' };
      np._raw = info.detail;
      np.price = Number(info.detail.price);
      if (info?.stock != null) {
        const existing = (items.find(x => String(x.id) === String(np.id)) || {}).qty || 0;
        if (existing + qty > info.stock) {
          const available = Math.max(0, info.stock - existing);
          return { ok: false, reason: `Stock insuficiente. Disponible: ${available}` };
        }
      }
    } catch (err) {
      return { ok: false, reason: err.message || 'No se pudo comprobar el stock' };
    }

    return dispatch((send, getState) => {
      const current = getState();
      if (!current.auth.isAuthenticated || current.auth.user?.id !== user?.id) return { ok: false, reason: 'La sesión cambió' };
      const quantity = (current.cart.items.find(item => String(item.id) === String(np.id))?.qty ?? 0) + qty;
      if (quantity > Number(np._raw.stock ?? np._raw.availableStock) || quantity > Number(np._raw.maxPurchaseQuantity ?? Infinity)) return { ok: false, reason: 'Cantidad superior al stock o límite de compra' };
      if (quantity < Number(np._raw.minPurchaseQuantity ?? 1)) return { ok: false, reason: `Cantidad mínima: ${np._raw.minPurchaseQuantity}` };
      send(addOrUpdateItem({ item: np, qty }));
      return { ok: true };
    });
  }, [dispatch, isAuthenticated, user, items]);

  const remove = useCallback((id) => {
    dispatch(removeItemAction(id));
  }, [dispatch]);

  const inc = useCallback(async (id) => {
    if (!isAuthenticated) {
      return { ok: false, reason: "Debes iniciar sesión para modificar el carrito" };
    }
    const it = items.find(x => String(x.id) === String(id));
    if (!it) return { ok: false, reason: "Item no encontrado" };
    return add({ ...it, _raw: { ...it._raw, id: it.id } }, 1);
  }, [items, isAuthenticated, add]);

  const dec = useCallback(async (id) => {
    const it = items.find(item => String(item.id) === String(id));
    if (!it) return { ok: false, reason: 'Item no encontrado' };
    const qty = it.qty - 1;
    if (qty === 0) { dispatch(removeItemAction(id)); return { ok: true }; }
    try {
      const info = await ensureProductDetail(it._raw, qty);
      if (qty < Number(info.detail.minPurchaseQuantity ?? 1)) return { ok: false, reason: 'Cantidad inferior al mínimo de compra' };
      return dispatch((send, getState) => {
        const current = getState();
        if (current.auth.user?.id !== user?.id || current.cart.items.find(item => String(item.id) === String(id))?.qty !== it.qty) return { ok: false, reason: 'El carrito cambió' };
        send(replaceItem({ item: normalizeProduct(info.detail), expectedQty: it.qty }));
        send(setItemQty({ id, qty }));
        return { ok: true };
      });
    } catch (error) { return { ok: false, reason: error.message }; }
  }, [dispatch, items, user]);

  const refreshCart = useCallback(async () => {
    const snapshot = dispatch((send, getState) => getState().cart.items);
    for (const it of snapshot) {
      try {
        const info = await ensureProductDetail(it._raw, it.qty);
        dispatch((send, getState) => {
          if (getState().auth.user?.id === user?.id) send(replaceItem({ item: normalizeProduct(info.detail), expectedQty: it.qty }));
        });
      } catch { /* Checkout retries validation on the server; keep items if temporarily offline. */ }
    }
  }, [dispatch, user?.id]);

  const clear = useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  const applyCouponByCode = useCallback(async (code, productId) => {
    if (!code) return { ok: false, reason: "Código vacío" };
    if (!isAuthenticated) return { ok: false, reason: "Debes iniciar sesión para usar cupones" };

    if (coupon && Number(couponProductId) !== Number(productId)) {
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
      const couponObj = { code: String(code).trim().toUpperCase(), discountAmount, discountId: resp.discountId ?? null };
      return dispatch((send, getState) => {
        const current = getState();
        const currentItem = current.cart.items.find(item => Number(item.id) === Number(productId));
        if (!current.auth.isAuthenticated || current.auth.user?.id !== user?.id || currentItem?.qty !== it.qty) return { ok: false, reason: 'El carrito cambió. Reintentá aplicar el cupón.' };
        send(setCoupon({ coupon: couponObj, productId: Number(productId) }));
        return { ok: true, discountAmount };
      });
    } catch (err) {
      console.error("applyCouponByCode error", err);
      return { ok: false, reason: err.message || "Error al validar cupón" };
    }
  }, [isAuthenticated, user, coupon, couponProductId, items, dispatch, hasProductPercentDiscount]);

  const removeCoupon = useCallback(() => {
    dispatch(clearCoupon());
  }, [dispatch]);

  const fetchAvailableCoupons = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch(setAvailableCoupons([]));
      return;
    }
    try {
      const p = await discountsService.getActiveCouponsByBuyer(0, 200);
      const list = p?.content ?? p ?? [];
      dispatch((send, getState) => { if (getState().auth.user?.id === user?.id) send(setAvailableCoupons(list)); });
    } catch (err) {
      console.warn("No se pudieron cargar cupones del usuario:", err);
      dispatch((send, getState) => { if (getState().auth.user?.id === user?.id) send(setAvailableCoupons([])); });
    }
  }, [dispatch, isAuthenticated, user?.id]);

  return {
    items,
    add,
    remove,
    inc,
    dec,
    clear,
    ...summary,
    appliedCoupon: coupon,
    couponTargetProductId: couponProductId,
    applyCouponByCode,
    removeCoupon,
    priceBreakdown,
    availableCoupons,
    fetchAvailableCoupons,
    refreshCart,
    hasProductPercentDiscount,
  };
}
