import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import productsService from "../services/productsService";
import * as discountsService from "../services/discountsService";
import {
  addOrUpdateItem,
  removeItem as removeItemAction,
  incItem,
  decItem,
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

async function ensureProductDetail(raw) {
  if (!raw) return null;
  const pid = raw.id ?? raw.productId;
  if (!pid) return null;
  const sellerId = raw.sellerId ?? raw.seller?.id ?? raw.sellerId;
  const stock = raw.availableStock ?? raw.stock ?? raw._stock ?? raw.available_stock;
  if (sellerId != null && stock != null) {
    return { sellerId, stock: Number(stock), detail: raw };
  }
  try {
    const p = await productsService.getById(pid);
    if (!p) return null;
    const resolvedStock = p.availableStock ?? p.stock ?? null;
    return {
      sellerId: p.sellerId ?? null,
      stock: resolvedStock == null ? null : Number(resolvedStock),
      detail: p
    };
  } catch (err) {
    console.warn("ensureProductDetail: error fetching product detail", err);
    return null;
  }
}

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const coupon = useAppSelector(selectCartCoupon);
  const couponProductId = useAppSelector(selectCartCouponProductId);
  const availableCoupons = useAppSelector(selectCartAvailableCoupons);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const hasProductPercentDiscount = useCallback((it) => {
    try {
      const bd = it._raw?.bestDiscount ?? it._raw?.best_discount ?? it.bestDiscount;
      if (!bd) return false;
      const t = (bd.type ?? "").toString().toUpperCase();
      if (t !== "PERCENT") return false;
      const v = Number(bd.value ?? 0);
      return v > 0;
    } catch {
      return false;
    }
  }, []);

  const priceBreakdown = useCallback((it) => {
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
      productPercent,
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
    qty = Number(qty) || 1;

    try {
      const info = await ensureProductDetail(np._raw);
      if (info?.sellerId != null && user && user.role === "SELLER" && Number(user.id) === Number(info.sellerId)) {
        return { ok: false, reason: "No puedes comprar tu propio producto" };
      }
      if (info?.stock != null) {
        const existing = (items.find(x => String(x.id) === String(np.id)) || {}).qty || 0;
        if (existing + qty > info.stock) {
          const available = Math.max(0, info.stock - existing);
          return { ok: false, reason: `Stock insuficiente. Disponible: ${available}` };
        }
      }
    } catch (e) {
    }

    dispatch(addOrUpdateItem({ item: np, qty }));
    return { ok: true };
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
    try {
      const info = await ensureProductDetail(it._raw);
      if (info?.stock != null && it.qty + 1 > info.stock) {
        return { ok: false, reason: "No hay más stock disponible" };
      }
      dispatch(incItem(id));
      return { ok: true };
    } catch (err) {
      console.warn("Error incrementando cantidad", err);
      return { ok: false, reason: "Error" };
    }
  }, [dispatch, items, isAuthenticated]);

  const dec = useCallback((id) => {
    dispatch(decItem(id));
  }, [dispatch]);

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
      dispatch(setCoupon({ coupon: couponObj, productId: Number(productId) }));
      return { ok: true, discountAmount };
    } catch (err) {
      console.error("applyCouponByCode error", err);
      return { ok: false, reason: err.message || "Error al validar cupón" };
    }
  }, [isAuthenticated, coupon, couponProductId, items, dispatch, hasProductPercentDiscount]);

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
      dispatch(setAvailableCoupons(list));
    } catch (err) {
      console.warn("No se pudieron cargar cupones del usuario:", err);
      dispatch(setAvailableCoupons([]));
    }
  }, [dispatch, isAuthenticated]);

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
    hasProductPercentDiscount,
  };
}
