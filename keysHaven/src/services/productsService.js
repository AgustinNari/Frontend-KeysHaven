import apiClient from "../api/apiClient";

const SORT_MAP = {
  amountSold: "amountSold",
  price: "price",
  createdAt: "createdAt",
  releaseDate: "releaseDate",
  metacritic: "metacriticScore",
  avgRating: "avgRating"
};

function mapSortKey(frontKey) {
  if (!frontKey) return "createdAt,desc";
  const parts = frontKey.split("_");
  const prop = parts[0];
  const dir = parts[1] === "asc" ? "asc" : "desc";
  const field = SORT_MAP[prop] ?? prop;
  return `${field},${dir}`;
}

function buildQueryParams({ filters = {}, page = 0, size = 12, sort = "createdAt_desc" } = {}) {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.set("sort", mapSortKey(sort));

  const f = filters || {};

  if (f.title) qs.set("title", f.title);
  if (f.sellerId) qs.set("sellerId", String(f.sellerId));
  if (f.minPrice != null) qs.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null) qs.set("maxPrice", String(f.maxPrice));
  if (f.platform) qs.set("platform", f.platform);
  if (f.region) qs.set("region", f.region);
  if (f.developer) qs.set("developer", f.developer);
  if (f.publisher) qs.set("publisher", f.publisher);
  if (f.releaseDateFrom) qs.set("releaseDateFrom", f.releaseDateFrom);
  if (f.releaseDateTo) qs.set("releaseDateTo", f.releaseDateTo);
  if (f.minMetacritic != null) qs.set("minMetacriticScore", String(f.minMetacritic));
  if (f.maxMetacritic != null) qs.set("maxMetacriticScore", String(f.maxMetacritic));
  if (f.featured != null) qs.set("featured", String(f.featured));

  if (f.categories && Array.isArray(f.categories) && f.categories.length) {
    f.categories.forEach(id => qs.append("categoryIds", String(id)));
  }
  if (f.minAvgRating != null) qs.set("minAvgRating", String(f.minAvgRating));

  if (f.minSold != null) qs.set("minAmountSold", String(f.minSold));
  if (f.minDiscountPct != null) qs.set("minDiscountPercent", String(f.minDiscountPct));
  if (f.minStock != null) qs.set("minStock", String(f.minStock));
  if (f.minRatingCount != null) qs.set("minRatingCount", String(f.minRatingCount));
  return qs.toString();
}


function normalizeDiscountValueToFraction(raw) {
  if (raw == null) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  if (n > 1) return n / 100;
  return n;
}

async function search(filters = {}, page = 0, size = 12, sort = "createdAt_desc", onlyActive = true) {
  const base = `/api/v1/products/filtered/${onlyActive ? "active" : "all"}`;
  const params = buildQueryParams({ filters, page, size, sort });
  const path = `${base}?${params}`;

  const resp = await apiClient.apiFetch(path);
  if (!resp) return { content: [], totalElements: 0, totalPages: 0, number: 0, size };

  const rawContent = resp.content || resp.items || [];

  const content = rawContent.map(p => {
    let primaryImageUrl = null;
    if (p.primaryImageDataUrl) primaryImageUrl = p.primaryImageDataUrl;
    else if (p.imageUrls && p.imageUrls.length > 0) primaryImageUrl = p.imageUrls[0];
    else if (p.primaryImageUrl) primaryImageUrl = p.primaryImageUrl;
    else if (p.primaryImageContentType && p.primaryImageDataUrl) primaryImageUrl = p.primaryImageDataUrl;

    let rawBestPct = null;
    if (p.bestDiscountPercentage != null) rawBestPct = p.bestDiscountPercentage;
    else if (p.bestDiscount && p.bestDiscount.value != null) rawBestPct = p.bestDiscount.value;

    let bestDiscountFrac = normalizeDiscountValueToFraction(rawBestPct);


    let discountedPrice = null;
    const basePrice = Number(p.price ?? 0);
    if (bestDiscountFrac != null && !Number.isNaN(basePrice)) {
      discountedPrice = Math.max(0, Math.round((basePrice * (1 - bestDiscountFrac)) * 100) / 100);
    }

    const discountPctDisplay = bestDiscountFrac != null ? Math.round(bestDiscountFrac * 100) : 0;

    return {
      ...p,
      primaryImageUrl,
      bestDiscountFrac,
      discountedPrice,
      discountPctDisplay
    };
  });

  return {
    content,
    totalElements: resp.totalElements ?? resp.total ?? (content.length),
    totalPages: resp.totalPages ?? Math.max(1, Math.ceil((resp.totalElements ?? resp.total ?? content.length) / (resp.size ?? size))),
    number: resp.number ?? page,
    size: resp.size ?? size
  };
}


async function getById(id) {
  const resp = await apiClient.apiFetch(`/products/${id}/detail`);
  if (!resp) return null;

  const p = resp;

  let images = p.images || [];
  let primaryImageUrl = null;
  if (images && images.length > 0) {
    const primary = images.find(i => i.isPrimary) || images[0];
    primaryImageUrl = primary.dataUrl ?? primary.file ?? null;
  }

  let bestDiscountFrac = null;
  let discountPctDisplay = 0;
  let discountedPrice = null;

  if (p.bestDiscount != null) {
    const rawVal = p.bestDiscount.value;
    bestDiscountFrac = normalizeDiscountValueToFraction(rawVal);

    if (p.bestDiscount.type === "PERCENT" || p.bestDiscount.type === "PERCENT") {
      if (bestDiscountFrac != null && !Number.isNaN(Number(p.price ?? 0))) {
        discountedPrice = Math.max(0, Math.round(((Number(p.price ?? 0)) * (1 - bestDiscountFrac)) * 100) / 100);
      }
      discountPctDisplay = bestDiscountFrac != null ? Math.round(bestDiscountFrac * 100) : 0;
    } else if (p.bestDiscount.type === "FIXED") {
      const fixedVal = Number(rawVal ?? 0);
      const basePrice = Number(p.price ?? 0);
      if (!Number.isNaN(basePrice)) {
        discountedPrice = Math.max(0, Math.round((basePrice - fixedVal) * 100) / 100);
      }
      discountPctDisplay = null;
    } else {
      if (bestDiscountFrac != null && !Number.isNaN(Number(p.price ?? 0))) {
        discountedPrice = Math.max(0, Math.round(((Number(p.price ?? 0)) * (1 - bestDiscountFrac)) * 100) / 100);
        discountPctDisplay = bestDiscountFrac != null ? Math.round(bestDiscountFrac * 100) : 0;
      }
    }
  }

  return {
    ...p,
    images,
    primaryImageUrl,
    bestDiscountFrac,
    discountedPrice,
    discountPctDisplay
  };
}

async function relatedByCategories(categoryIds = [], excludeProductId = null, size = 6) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return [];
  const filters = { categories: categoryIds };
  const res = await search(filters, 0, size, "amountSold_desc", true);
  const items = res.content || [];
  const filtered = items.filter(it => it.id !== Number(excludeProductId)).slice(0, size);
  return filtered;
}

async function productsBySeller(sellerId, excludeProductId = null, size = 6) {
  if (!sellerId) return [];
  const res = await search({ sellerId }, 0, size, "amountSold_desc", true);
  const items = res.content || [];
  return items.filter(it => it.id !== Number(excludeProductId)).slice(0, size);
}

export default {
  search,
  getById,
  relatedByCategories,
  productsBySeller,
  mapSortKey,
  SORT_MAP
};
