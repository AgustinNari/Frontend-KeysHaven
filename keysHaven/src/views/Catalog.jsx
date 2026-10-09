import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarFilters from "../components/catalog/SidebarFilters";
import SearchBar from "../components/catalog/SearchBar";
import SortDropdown from "../components/catalog/SortDropdown";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import "../components/estilos/catalog.css";
import Loading from "../assets/doppyKnight/doppyTimeCheck.png";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { searchProducts, fetchFilterExtras, selectProductsFilterExtras, selectSearchPages, makeProductsSearchKey } from "../redux/slices/productsSlice";
import { fetchAllCategories, selectAllCategories } from "../redux/slices/categoriesSlice";

import { useCart } from "../store/cart.jsx";

const platformMap = {
    PC: "PC – Steam",
    PlayStation: "PlayStation 5",
    Xbox: "Xbox Series X|S",
    Nintendo: "Nintendo Switch 2",
    all: null
  };
const emptyExtras = { developers: [], publishers: [] };

export default function Catalog() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const queryParams = new URLSearchParams(location.search);
  const queryTitle = queryParams.get("title");
  const querySellerId = queryParams.get("sellerId");
  const rawPlatform = queryParams.get("platform");
  const queryCategoryId = queryParams.get("categoryId");

  const filterExtras = useAppSelector(selectProductsFilterExtras) ?? emptyExtras;
  const allCategories = useAppSelector(selectAllCategories);
  const searchPages = useAppSelector(selectSearchPages);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("amountSold_desc");
  const [workingFilters, setWorkingFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const [categoriesOptions, setCategoriesOptions] = useState([]);
  const [sellersOptions, setSellersOptions] = useState([]);

  const [developerOptions, setDeveloperOptions] = useState([]);
  const [publisherOptions, setPublisherOptions] = useState([]);

  const { add } = useCart();



  useEffect(() => {
    if (queryCategoryId) {
      const idNum = Number(queryCategoryId);
      if (!Number.isNaN(idNum)) {
        setAppliedFilters(prev => ({ ...prev, categories: [idNum] }));
        setWorkingFilters(prev => ({ ...prev, categories: [idNum] }));
        setPage(1);
      }
    }
  }, [queryCategoryId]);

  useEffect(() => {
    if (querySellerId) {
      const sellerIdNum = Number(querySellerId);
      if (!Number.isNaN(sellerIdNum)) {
        setAppliedFilters(prev => ({ ...prev, sellerIds: [sellerIdNum] }));
        setWorkingFilters(prev => ({ ...prev, sellerIds: [sellerIdNum] }));
        setPage(1);
      }
    }
  }, [querySellerId]);

  useEffect(() => {
    if (queryTitle) setSearchText(queryTitle);
  }, [queryTitle]);

  useEffect(() => {
    if (!rawPlatform) return;
    const mapped = platformMap[rawPlatform];
    if (!mapped) {
      setAppliedFilters(prev => {
        const copy = { ...prev };
        delete copy.platform;
        return copy;
      });
      setWorkingFilters(prev => {
        const copy = { ...prev };
        delete copy.platform;
        return copy;
      });
      return;
    }
    setAppliedFilters(prev => ({ ...prev, platform: mapped }));
    setWorkingFilters(prev => ({ ...prev, platform: mapped }));
    setPage(1);
  }, [rawPlatform]);

  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchFilterExtras());
  }, [dispatch]);

  useEffect(() => {
    setCategoriesOptions((allCategories || []).map(c => ({ id: c.id, description: c.description || c.name })));
  }, [allCategories]);

  useEffect(() => {
    setDeveloperOptions((filterExtras?.developers || []).map(d => ({ value: d, label: d })));
    setPublisherOptions((filterExtras?.publishers || []).map(p => ({ value: p, label: p })));
  }, [filterExtras]);

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, title: searchText }));
      setPage(1);
    }, 600);
    return () => clearTimeout(t);
  }, [searchText]);

  const buildBackendFilters = (af) => {
    const backendFilters = { ...(af || {}) };
    if (backendFilters.sellerIds && !Array.isArray(backendFilters.sellerIds)) backendFilters.sellerIds = [backendFilters.sellerIds];
    if (backendFilters.categories && !Array.isArray(backendFilters.categories)) backendFilters.categories = [backendFilters.categories];
    return backendFilters;
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        const backendPage = Math.max(0, page - 1);
        const backendFilters = buildBackendFilters(appliedFilters);
        const key = makeProductsSearchKey({ filters: backendFilters, page: backendPage, size: pageSize, sort: sortBy, onlyActive: true });

        const cached = searchPages?.[key];
        if (cached) {
          if (!cancelled) {
            setLoading(false);
            const content = cached?.content ?? cached?.items ?? [];
            setItems(content);
            setTotalItems(cached?.totalElements ?? cached?.total ?? content.length);
            setTotalPages(Math.max(1, cached?.totalPages ?? Math.ceil((cached?.totalElements ?? content.length) / pageSize)));
          }
          return;
        }
        const resp = await dispatch(searchProducts({ filters: backendFilters, page: backendPage, size: pageSize, sort: sortBy, onlyActive: true })).unwrap();
        if (cancelled) return;
        const payload = resp?.resp ?? resp;
        const content = payload?.content ?? payload?.items ?? [];
        setItems(content);
        setTotalItems(payload?.totalElements ?? payload?.total ?? content.length);
        setTotalPages(Math.max(1, payload?.totalPages ?? Math.ceil((payload?.totalElements ?? content.length) / pageSize)));
      } catch (err) {
        console.error("Error searching products (redux)", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [appliedFilters, page, sortBy, dispatch, searchPages]);

  useEffect(() => {
    const extractUniqueSellers = (products) => {
      const sellerMap = new Map();
      products.forEach(product => {
        const sid = product.sellerId ?? product.seller?.id;
        const display = product.sellerDisplayName || product.sellerName || product.seller?.displayName || product.seller;
        if (sid && display) {
          if (!sellerMap.has(sid)) sellerMap.set(sid, { id: sid, displayName: display });
        }
      });
      return Array.from(sellerMap.values());
    };

    const unique = extractUniqueSellers(items);
    setSellersOptions(prev => {
      const map = new Map(prev.map(s => [String(s.id), s]));
      unique.forEach(u => { if (!map.has(String(u.id))) map.set(String(u.id), u); });
      return Array.from(map.values());
    });
  }, [items]);

  const handleSearchSubmit = () => {
    setAppliedFilters(prev => ({ ...prev, title: searchText }));
    setPage(1);
  };

  const handleApply = (filters) => {
    setAppliedFilters(prev => ({ ...prev, ...filters, title: filters.title ?? (prev.title ?? "") }));
    setPage(1);
  };

  const handleClearAll = () => {
    if (querySellerId) {
      const sellerIdNum = Number(querySellerId);
      setWorkingFilters({ sellerIds: [sellerIdNum] });
      setAppliedFilters({ sellerIds: [sellerIdNum] });
      setSearchText("");
    } else if (queryCategoryId) {
      const idNum = Number(queryCategoryId);
      setWorkingFilters({ categories: [idNum] });
      setAppliedFilters({ categories: [idNum] });
      setSearchText("");
    } else {
      setWorkingFilters({});
      setAppliedFilters({});
      setSearchText("");
    }
    setPage(1);
  };

  return (
    <div className="app-container">
      <div className="catalog-layout">
        <aside className="sidebar">
          <SidebarFilters
            categories={categoriesOptions}
            sellers={sellersOptions}
            workingFilters={workingFilters}
            setWorkingFilters={setWorkingFilters}
            onApply={handleApply}
            onClearAll={handleClearAll}
            developerOptions={developerOptions}
            publisherOptions={publisherOptions}
          />
        </aside>

        <main className="catalog-content">
          <div className="d-flex justify-content-space-between catalog-header mb-3">
            <div className="titles">
              <h1>Catálogo de Juegos</h1>
              <p className="lead">Explora nuestra amplia selección — usa filtros para afinar resultados.</p>
            </div>

            <div className="catalog-controls d-flex align-items-center gap-2">
              <div className="search-bar-wrapper">
                <SearchBar value={searchText} onChange={setSearchText} onSearch={handleSearchSubmit} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="small muted">Ordenar:</div>
                <div className="sort-dropdown-wrapper">
                  <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
              <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
              <img src={Loading} alt="Cargando..." style={{ width: "120px", height: "160px" }} />
            </div>
          ) : (
            <>
              <ProductGrid products={items} onAdd={add} />

              <div className="mt-3">
                <div style={{ color: "#e6dbff" }} className="mb-2">
                  Mostrando {items.length} de {totalItems} resultados
                </div>
                <div className="pagination-center">
                  <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
