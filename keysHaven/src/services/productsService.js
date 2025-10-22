import apiClient from "../api/apiClient";


const SORT_MAP = {
  amountSold: "sold",
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

async function search(filters = {}, page = 0, size = 12, sort = "createdAt_desc", onlyActive = true) {
  const base = `/api/v1/products/filtered/${onlyActive ? "active" : "all"}`;
  const params = buildQueryParams({ filters, page, size, sort });
  const path = `${base}?${params}`;

  const resp = await apiClient.apiFetch(path);
  if (!resp) return { content: [], totalElements: 0, totalPages: 0, number: 0, size };

  const content = (resp.content || resp.items || []).map(p => {

    let primaryImageUrl = null;
    if (p.primaryImageDataUrl) primaryImageUrl = p.primaryImageDataUrl;
    else if (p.imageUrls && p.imageUrls.length > 0) primaryImageUrl = p.imageUrls[0];
    else if (p.primaryImageContentType && p.primaryImageDataUrl) primaryImageUrl = p.primaryImageDataUrl;

    if (!primaryImageUrl && p.primaryImageUrl) primaryImageUrl = p.primaryImageUrl;

    return {
      ...p,
      primaryImageUrl
    };
  });

  function getTopSoldProducts(size = 4) {
  return apiClient.search({}, 0, size, "amountSold_desc");
}

  return {
    content,
    totalElements: resp.totalElements ?? resp.total ?? (content.length),
    totalPages: resp.totalPages ?? Math.max(1, Math.ceil((resp.totalElements ?? resp.total ?? content.length) / (resp.size ?? size))),
    number: resp.number ?? page,
    size: resp.size ?? size
  };
}

export default { search,getTopSoldProducts, mapSortKey, SORT_MAP };

/*export default {
  search: apiClient.search,
  getTopSoldProducts, // <-- add this export
  mapSortKey: apiClient.mapSortKey,
  SORT_MAP: apiClient.SORT_MAP,
};*/
