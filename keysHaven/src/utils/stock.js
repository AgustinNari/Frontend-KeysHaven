export function deriveAvailableStock(product) {
  if (!product) return 0;

  const candidates = [
    product.availableStock,
    product.available_stock,
    product.available_stock_count,
    product.available,
    product.stock,
    product.availableQuantity,
    product.available_quantity,
    product.availableQty,
    product.available_qty,
    product.quantity,
    product.qty
  ];

  for (const c of candidates) {
    if (typeof c === 'number' && !Number.isNaN(c)) return c;
    if (typeof c === 'string' && c.trim() !== '' && !Number.isNaN(Number(c))) {
      return Number(c);
    }
  }
  try {
    const inv = product.inventory;
    if (inv && typeof inv === 'object') {
      const invCandidates = [inv.available, inv.availableStock, inv.stock, inv.qty, inv.quantity];
      for (const ic of invCandidates) {
        if (typeof ic === 'number' && !Number.isNaN(ic)) return ic;
        if (typeof ic === 'string' && ic.trim() !== '' && !Number.isNaN(Number(ic))) return Number(ic);
      }
    }
  } catch { /* Ignore malformed optional inventory metadata. */ }

  try {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const sum = product.variants.reduce((acc, v) => {
        const s = deriveAvailableStock(v);
        return acc + (Number(s) || 0);
      }, 0);
      return sum;
    }
  } catch { /* Ignore malformed optional variant metadata. */ }

  return 0;
}

export function normalizeProductsStock(items = []) {
  if (!Array.isArray(items)) return items;
  return items.map(p => ({ ...p, availableStock: deriveAvailableStock(p) }));
}
