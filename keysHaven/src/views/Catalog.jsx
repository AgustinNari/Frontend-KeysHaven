import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import SidebarFilters from "../components/catalog/SidebarFilters";
import SearchBar from "../components/catalog/SearchBar";
import SortDropdown from "../components/catalog/SortDropdown";
import ProductGrid from "../components/catalog/ProductGrid";
import PaginationBar from "../components/catalog/PaginationBar";
import "../components/estilos/catalog.css";

import productsService from "../services/productsService";
import categoriesService from "../services/categoriesService";
import { useCart } from "../store/cart.jsx";

export default function Catalog() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryTitle = queryParams.get("title");
  const querySellerId = queryParams.get("sellerId");

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

  const queryCategoryId = queryParams.get("categoryId");

  const { add } = useCart();

  // Función para extraer vendedores únicos de los productos
  const extractUniqueSellers = (products) => {
    const sellerMap = new Map();
    
    products.forEach(product => {
      if (product.sellerId && product.sellerDisplayName) {
        if (!sellerMap.has(product.sellerId)) {
          sellerMap.set(product.sellerId, {
            id: product.sellerId,
            displayName: product.sellerDisplayName
          });
        }
      }
    });
    
    return Array.from(sellerMap.values());
  };

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

  // Cargar categorías
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await categoriesService.getAllCategories();
        if (cancelled) return;
        const opts = (cats || []).map(c => ({ id: c.id, description: c.description }));
        setCategoriesOptions(opts);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Cargar productos y extraer vendedores
  useEffect(() => {
    let cancelled = false;
    const fetchItems = async () => {
      setLoading(true);
      try {
        const backendPage = Math.max(0, page - 1);
        
        const backendFilters = { ...appliedFilters };
        
        if (backendFilters.sellerIds && !Array.isArray(backendFilters.sellerIds)) {
          backendFilters.sellerIds = [backendFilters.sellerIds];
        }
        
        const resp = await productsService.search(backendFilters, backendPage, pageSize, sortBy, true);
        if (cancelled) return;
        
        const content = resp.content || [];
        setItems(content);
        setTotalItems(resp.totalElements ?? content.length);
        setTotalPages(Math.max(1, resp.totalPages ?? Math.ceil((resp.totalElements ?? content.length) / pageSize)));
        
        // Extraer vendedores únicos de los productos cargados
        const uniqueSellers = extractUniqueSellers(content);
        setSellersOptions(uniqueSellers);
        
      } catch (err) {
        console.error("Error fetching products:", err);
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
        setSellersOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchItems();
  }, [appliedFilters, page, pageSize, sortBy]);

  // Cargar vendedores iniciales (sin filtros aplicados)
  useEffect(() => {
    let cancelled = false;
    const loadInitialSellers = async () => {
      try {
        // Hacer una búsqueda inicial sin filtros para obtener algunos vendedores
        const resp = await productsService.search({}, 0, 50, "amountSold_desc", true);
        if (cancelled) return;
        
        const content = resp.content || [];
        const uniqueSellers = extractUniqueSellers(content);
        setSellersOptions(prev => {
          // Combinar con los existentes para no perder vendedores ya cargados
          const combined = [...prev];
          uniqueSellers.forEach(newSeller => {
            if (!combined.find(s => s.id === newSeller.id)) {
              combined.push(newSeller);
            }
          });
          return combined;
        });
      } catch (err) {
        console.error("Error loading initial sellers:", err);
      }
    };

    // Solo cargar vendedores iniciales si no hay ninguno
    if (sellersOptions.length === 0) {
      loadInitialSellers();
    }
    
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedFilters(prev => ({ ...prev, title: searchText }));
      setPage(1);
    }, 600);
    return () => clearTimeout(t);
  }, [searchText]);

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
          />
        </aside>

        <main className="catalog-content">
          <div className="d-flex justify-content-space-between catalog-header mb-3">
            <div className="titles">
              <h1>Catálogo de Juegos</h1>
              <p className="lead">Explora nuestra amplia selección — usa filtros para afinar resultados.</p>
            </div>

            <div className="d-flex align-items-center justify-content-space-between gap-2">
              <div className="search-bar-wrapper" style={{ minWidth: 260 }}>
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  onSearch={handleSearchSubmit}
                />
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