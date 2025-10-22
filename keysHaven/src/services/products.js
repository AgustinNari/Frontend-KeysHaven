import apiClient from "../api/apiClient";



const SORT_MAP = {
  amountSold: "createdAt",
  price: "price",
  createdAt: "createdAt",
  releaseDate: "releaseDate",
  metacritic: "metacriticScore",
  avgRating: "avgRating"
};

function mapSortKey(frontKey) {
  if (!frontKey) return "createdAt,desc";
  const [prop, dir] = frontKey.split("_");
  const field = SORT_MAP[prop] ?? prop;
  const d = dir === "asc" ? "asc" : "desc";
  return `${field},${d}`;
}

function buildFilterParams(filters = {}, page = 0, size = 12, sortKey = "amountSold_desc", onlyActive = true) {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);
  params.append("sort", mapSortKey(sortKey));

  if (filters.title) params.append("title", filters.title);
  if (filters.sellerId != null) params.append("sellerId", filters.sellerId);
  if (filters.minPrice != null) params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.append("maxPrice", String(filters.maxPrice));
  if (filters.platform) params.append("platform", filters.platform);
  if (filters.region) params.append("region", filters.region);
  if (filters.developer) params.append("developer", filters.developer);
  if (filters.publisher) params.append("publisher", filters.publisher);
  if (filters.releaseDateFrom) params.append("releaseDateFrom", filters.releaseDateFrom);
  if (filters.releaseDateTo) params.append("releaseDateTo", filters.releaseDateTo);
  if (filters.minMetacritic != null) params.append("minMetacriticScore", String(filters.minMetacritic));
  if (filters.maxMetacritic != null) params.append("maxMetacriticScore", String(filters.maxMetacritic));
  if (filters.featured != null) params.append("featured", String(filters.featured));
  if (filters.minAvgRating != null) params.append("minAvgRating", String(filters.minAvgRating));
  if (filters.minRatingCount != null) params.append("minRatingCount", String(filters.minRatingCount));
  if (filters.minStock != null) params.append("minStock", String(filters.minStock));
  if (filters.minAmountSold != null) params.append("minAmountSold", String(filters.minAmountSold));
  if (filters.minDiscountPct != null) params.append("minDiscountPct", String(filters.minDiscountPct));

  if (Array.isArray(filters.categories) && filters.categories.length > 0) {
    filters.categories.forEach(c => params.append("categoryIds", String(c)));
  }

  return params.toString();
}

async function search(filters = {}, page = 0, size = 12, sortKey = "amountSold_desc", onlyActive = true) {
  const qs = buildFilterParams(filters, page, size, sortKey, onlyActive);
  const path = onlyActive ? `/api/v1/products/filtered/active?${qs}` : `/api/v1/products/filtered/all?${qs}`;
  return apiClient.apiFetch(path);
}

async function getById(id) {
  return apiClient.apiFetch(`/products/${id}/detail`);
}

async function relatedByCategories(categoryIds = [], excludeProductId = null, limit = 6) {
  const filters = { categories: categoryIds };
  const res = await search(filters, 0, limit, "amountSold_desc", true);
  const items = res?.content || [];
  return items.filter(p => p.id !== excludeProductId).slice(0, limit);
}

async function productsBySeller(sellerId, excludeProductId = null, limit = 6) {
  const filters = { sellerId };
  const res = await search(filters, 0, limit, "amountSold_desc", true);
  const items = res?.content || [];
  return items.filter(p => p.id !== excludeProductId).slice(0, limit);
}

export default {
  search,
  getById,
  relatedByCategories,
  productsBySeller,
  buildFilterParams,
  mapSortKey
};
