import React, { useState, useEffect, useCallback } from "react";
import SidebarFilters from "../components/catalog/SidebarFilters";
import SearchBar from "../components/catalog/SearchBar";
import SortDropdown from "../components/catalog/SortDropdown";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import { PRODUCTS as MOCK_PRODUCTS } from "../data/products";
import "../components/estilos/catalog.css";

import { useCart } from "../store/cart.jsx";

export default function Catalog() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("amountSold_desc");
  const [workingFilters, setWorkingFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { add } = useCart();

  const simulateServerFetch = useCallback((filters, pageNum, pageSizeNum, sort) => {
    let arr = MOCK_PRODUCTS.slice();

    if (filters.title && filters.title.trim()) {
      const q = filters.title.trim().toLowerCase();
      arr = arr.filter(p => p.title.toLowerCase().includes(q));
    }
    if (filters.minPrice != null) arr = arr.filter(p => (p.price ?? 0) >= filters.minPrice);
    if (filters.maxPrice != null) arr = arr.filter(p => (p.price ?? 0) <= filters.maxPrice);
    if (filters.platform) arr = arr.filter(p => p.platform === filters.platform);
    if (filters.region) arr = arr.filter(p => p.region === filters.region);
    if (filters.developer) arr = arr.filter(p => p.developer === filters.developer);
    if (filters.publisher) arr = arr.filter(p => p.publisher === filters.publisher);
    if (filters.releaseDateFrom) arr = arr.filter(p => new Date(p.releaseDate) >= new Date(filters.releaseDateFrom));
    if (filters.releaseDateTo) arr = arr.filter(p => new Date(p.releaseDate) <= new Date(filters.releaseDateTo));
    if (filters.minMetacritic != null) arr = arr.filter(p => (p.metacriticScore ?? 0) >= filters.minMetacritic);
    if (filters.maxMetacritic != null) arr = arr.filter(p => (p.metacriticScore ?? 0) <= filters.maxMetacritic);
    if (filters.categories && filters.categories.length > 0) {
      arr = arr.filter(p => filters.categories.every(c => p.categories.includes(c)));
    }
    if (filters.minAvgRating != null) arr = arr.filter(p => (p.avgRating ?? 0) >= filters.minAvgRating);
    if (filters.minSold != null) arr = arr.filter(p => (p.sold ?? 0) >= filters.minSold);
    if (filters.minDiscountPct != null) {
      arr = arr.filter(p => {
        if (!p.originalPrice) return false;
        const pct = Math.round((1 - p.price / p.originalPrice) * 100);
        return pct >= filters.minDiscountPct;
      });
    }

    arr = arr.filter(p => p.active !== false && (p.stock ?? 0) >= 1);

    switch (sort) {
      case "price_asc": arr.sort((a,b)=> (a.price??0)-(b.price??0)); break;
      case "price_desc": arr.sort((a,b)=> (b.price??0)-(a.price??0)); break;
      case "createdAt_asc": arr.sort((a,b)=> new Date(a.releaseDate) - new Date(b.releaseDate)); break;
      case "createdAt_desc": arr.sort((a,b)=> new Date(b.releaseDate) - new Date(a.releaseDate)); break;
      case "metacritic_asc": arr.sort((a,b)=> (a.metacriticScore??0)-(b.metacriticScore??0)); break;
      case "metacritic_desc": arr.sort((a,b)=> (b.metacriticScore??0)-(a.metacriticScore??0)); break;
      case "avgRating_desc": arr.sort((a,b)=> (b.avgRating??0)-(a.avgRating??0)); break;
      case "amountSold_desc":
      default: arr.sort((a,b)=> (b.sold??0)-(a.sold??0)); break;
    }

    const total = arr.length;
    const start = (pageNum - 1) * pageSizeNum;
    const pageItems = arr.slice(start, start + pageSizeNum);
    return { items: pageItems, total };
  }, []);

  useEffect(() => {
    const res = simulateServerFetch(appliedFilters, page, pageSize, sortBy);
    setItems(res.items);
    setTotalItems(res.total);
    setTotalPages(Math.max(1, Math.ceil(res.total / pageSize)));
  }, [appliedFilters, page, pageSize, sortBy, simulateServerFetch]);

  const handleApply = (filters) => {
    setAppliedFilters({ ...filters, title: filters.title ?? searchText ?? "" });
    setPage(1);
  };

  const handleClearAll = () => {
    setWorkingFilters({});
    setAppliedFilters({});
    setSearchText("");
    setPage(1);
  };

  return (
    <div className="app-container">
      <div className="catalog-layout">
        <aside className="sidebar">
          <SidebarFilters
            workingFilters={workingFilters}
            setWorkingFilters={setWorkingFilters}
            onApply={handleApply}
            onClearAll={handleClearAll}
          />
        </aside>

        <main className="catalog-content">
          <div className="catalog-header mb-3">
            <div className="titles">
              <h1>Catálogo de Juegos</h1>
              <p className="lead">Explora nuestra amplia selección — usa filtros para afinar resultados.</p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="search-bar-wrapper">
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  onSearch={() => { setAppliedFilters(prev => ({ ...prev, title: searchText })); setPage(1); }}
                />
              </div>
              <text-muted>Ordenar:</text-muted>
              <div className="sort-dropdown-wrapper">
                <SortDropdown value={sortBy} onChange={setSortBy} />
              </div>
            </div>
          </div>

          <ProductGrid products={items} onAdd={add} />

          <div className="mt-3">
            <div style={{ color: "#e6dbff" }} className="mb-2">
              Mostrando {items.length} de {totalItems} resultados
            </div>
            <div className="pagination-center">
              <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
