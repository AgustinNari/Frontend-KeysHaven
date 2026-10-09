import { localizeErrorMessage } from '../utils/displayText';
import bundledAsset0 from "../assets/react.svg";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/estilos/Fondos.css";
import "../components/estilos/home.css";
import HomeBanner from '../assets/homeImage.png';
import HomePanorama from '../assets/home-hero-panorama.webp';
import Loading from "../assets/doppyKnight/doppyTimeCheck.png";
import ReviewCarousel from "../components/home/ReviewCarousel";
import FeaturedProductsCarousel from "../components/home/FeaturedProductsCarrousel";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchFeaturedCategories, selectFeaturedCategories } from "../redux/slices/categoriesSlice";
import { fetchTopSellers, selectTopSellers } from "../redux/slices/sellersSlice";
import { fetchTopSoldProducts, selectTopSoldProducts } from "../redux/slices/productsSlice";

const categoryIcons = { accion: "fa-bolt", aventura: "fa-compass", rpg: "fa-dice-d20", estrategia: "fa-chess-knight", simulacion: "fa-city", indie: "fa-gamepad" };
const categoryIcon = (label = "") => categoryIcons[label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()] || "fa-tags";

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [theme] = useState("dark");

  const categories = useAppSelector(selectFeaturedCategories);
  const sellers = useAppSelector(selectTopSellers);
  const products = useAppSelector(selectTopSoldProducts);

  const sellersCount = useAppSelector(state => (state.sellers?.topSellers?.length ?? 0));
  const sellersNeedsRefresh = useAppSelector(state => !!state.sellers?.needsRefresh);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sellersError, setSellersError] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const inputRef = useRef(null);
  const toolbarRef = useRef(null);
  const pageRef = useRef(null);
  const searchButtonRef = useRef(null);
  const restoreSearchFocus = useRef(false);
  const [searchMode, setSearchMode] = useState(false);
  const [active, setActive] = useState("all");
  const icons = [
    { id: "PC", icon: "fab fa-windows" },
    { id: "PlayStation", icon: "fab fa-playstation" },
    { id: "Xbox", icon: "fab fa-xbox" },
    { id: "Nintendo", icon: "fas fa-gamepad" },
    { id: "all", icon: "fa-solid fa-dice-d20" },
  ];
  const [searchText, setSearchText] = useState("");

  const handleSearch = (term) => {
    const query = term.trim();
    let url = `/catalog?`;
    if (query.length > 0) url += `title=${encodeURIComponent(query)}`;
    if (active && active !== "all") {
      url += `${query.length > 0 ? "&" : ""}platform=${encodeURIComponent(active)}`;
    }
    navigate(url);
  }

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      if (categories && categories.length > 0) return;
      try {
        setCategoriesError(null);
        setLoadingCategories(true);
        await dispatch(fetchFeaturedCategories({ page: 0, size: 5 })).unwrap();
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load top categories (redux)", err);
        setCategoriesError(err?.message || "Error cargando categorías");
      } finally {
        setLoadingCategories(false);
        if (mounted) setLoadingCategories(false);
      }
    };

    loadCategories();
    return () => { mounted = false; };
  }, [dispatch, categories]);

  useEffect(() => {
    let mounted = true;
    const loadSellers = async () => {
      if (sellersCount > 0 && !sellersNeedsRefresh) return;
      try {
        setSellersError(null);
        setLoadingSellers(true);
        await dispatch(fetchTopSellers(8)).unwrap();
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load top sellers (redux)", err);
        setSellersError(err?.message || "Error cargando vendedores");
      } finally {
        setLoadingSellers(false)
        if (mounted) setLoadingSellers(false);
      }
    };

    loadSellers();
    return () => { mounted = false; };
  }, [dispatch, sellersCount, sellersNeedsRefresh]);

  useEffect(() => {
    let mounted = true;
    const loadTopSold = async () => {
      if (products && products.length > 0) return;
      try {
        setProductsError(null);
        setLoadingProducts(true);
        await dispatch(fetchTopSoldProducts(4)).unwrap();
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to load top sold products (redux)", err);
        setProductsError(err?.message || "Error cargando productos");
      } finally {
        setLoadingProducts(false)
        if (mounted) setLoadingProducts(false);
      }
    };

    loadTopSold();
    return () => { mounted = false; };
  }, [dispatch, products]);

  useEffect(() => {
    if (searchMode) inputRef.current?.focus();
    else if (restoreSearchFocus.current) {
      searchButtonRef.current?.focus();
      restoreSearchFocus.current = false;
    }
  }, [searchMode]);

  useEffect(() => {
    const page = pageRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!page || motion.matches || !("IntersectionObserver" in window)) return;
    // Content stays visible; only animate once when a section enters the viewport.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("home-revealed");
        observer.unobserve(target);
      });
    }, { threshold: 0.08 });
    page.querySelectorAll(".home-reveal").forEach(section => observer.observe(section));
    return () => {
      observer.disconnect();
      page.querySelectorAll(".home-revealed").forEach(section => section.classList.remove("home-revealed"));
    };
  }, []);

  const closeSearch = () => {
    restoreSearchFocus.current = true;
    setSearchMode(false);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) setSearchMode(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div data-bs-theme={theme} className="home-page bg-primary-dark text-body" ref={pageRef}>
      <div className="home-search-toolbar" ref={toolbarRef} aria-label="Plataformas y búsqueda">
        <div className={`home-search-pill ${searchMode ? "is-searching" : ""}`}>
          <div className="home-platform-controls" inert={searchMode}>
            {icons.map(({ id, icon }) => (
              <button key={id} type="button"
                aria-label={id === "all" ? "Todas las plataformas" : id}
                aria-pressed={active === id}
                onClick={() => setActive(id)}
                className={`home-platform-button ${active === id ? "is-active" : ""}`}>
                <i className={icon} aria-hidden="true" />
              </button>
            ))}
            <button ref={searchButtonRef} type="button" aria-label="Buscar juegos"
              aria-expanded={searchMode} aria-controls="home-search-form"
              className="home-search-open" onClick={() => setSearchMode(true)}>
              <i className="fas fa-search" aria-hidden="true" />
            </button>
          </div>
          <form id="home-search-form" role="search" aria-label="Buscar juegos"
            className="home-search-form" inert={!searchMode}
            onSubmit={(e) => { e.preventDefault(); handleSearch(searchText); setSearchMode(false); }}>
            <input ref={inputRef} aria-label="Buscar juegos por título" type="search"
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              className="form-control bg-dark text-light border-0"
              placeholder="Buscar juegos..."
              onKeyDown={(e) => { if (e.key === "Escape") closeSearch(); }} />
            <button type="submit" aria-label="Buscar" className="home-search-action">
              <i className="fas fa-search" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Cerrar búsqueda" className="home-search-action" onClick={closeSearch}>
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Hero */}
      <section className="home-hero text-white">
        <picture className="home-hero-media">
          <source media="(max-width: 575px)" srcSet={HomeBanner} />
          <img className="home-hero-image" src={HomePanorama} alt="Jugador con auriculares frente a su computadora" />
        </picture>
        <div className="home-hero-layout">
          <div className="home-hero-copy">
            <h1 className="fw-bold">La clave para jugar sin límites</h1>
            <p className="lead mt-3 text-light">Explora el catálogo de videojuegos y encuentra tu próxima aventura.</p>
          </div>
        </div>
      </section>

      <div className="home-reveal"><FeaturedProductsCarousel /></div>

      {/* Categories */}
      <section className="home-reveal py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Categorías Destacadas</h2>
          <div className="row g-4 justify-content-center">
            {loadingCategories && (
              <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "40px" }}>
                <div className="spinner-border text-primary ms-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}><span className="visually-hidden">Cargando...</span></div>
                <img src={Loading} alt="Cargando..." style={{ width: "120px", height: "160px" }} />
              </div>
            )}

            {!loadingCategories && !categoriesError && (!categories || categories.length === 0) && (
              <p className="text-light">No se encontraron categorías.</p>
            )}

            {!loadingCategories && !categoriesError && categories.map((cat, i) => (
              <div key={cat.id ?? i} className="col-6 col-md-4 col-lg-2">
                <button type="button" onClick={() => navigate(`/catalog?categoryId=${encodeURIComponent(cat.id)}`)} className="home-category w-100">
                  <i className={`fa-solid ${categoryIcon(cat.description || cat.name)}`} aria-hidden="true" />
                  <div className="fw-bold">
                    {cat.description || cat.name || `Categoria ${cat.id}`}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="home-reveal py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Vendedores Más Elegidos</h2>
          <div className="row g-5 justify-content-center">
            {loadingSellers && (
              <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "40px" }}>
                <div className="spinner-border text-primary ms-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}><span className="visually-hidden">Cargando...</span></div>
                <img src={Loading} alt="Cargando..." style={{ width: "120px", height: "160px" }} />
              </div>
            )}

            {sellersError && (<p className="text-danger">Error: {localizeErrorMessage(sellersError)}</p>)}

            {!loadingSellers && !sellersError && (!sellers || sellers.length === 0) && (<p className="text-light">No se encontraron vendedores.</p>)}

            {!loadingSellers && !sellersError && sellers.map((seller, i) => (
              <div key={seller.id ?? i} className="col-6 col-md-3 text-center">
                <a href={`/seller-detail/${seller.id}`} className="text-decoration-none text-body text-primary-light">
                  <img src={seller.avatarDataUrl || bundledAsset0} className="home-seller-avatar rounded-circle border border-primary border-3 mb-3" width="160" height="160" alt={seller.displayName} />
                  <h5 className="text-light fw-bold">{seller.displayName}</h5>
                  <small className="text-light">{seller.amountSold} ventas • {((seller.avgRating ?? 0) / 2).toFixed(1)}★</small>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Bought Products */}
      <section className="home-reveal py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">Llaves Más Elegidas</h2>

          {loadingProducts && (
            <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "40px" }}>
              <div className="spinner-border text-primary ms-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}><span className="visually-hidden">Cargando...</span></div>
              <img src={Loading} alt="Cargando..." style={{ width: "120px", height: "160px" }} />
            </div>
          )}
          {productsError && <p className="text-danger text-center">Error: {localizeErrorMessage(productsError)}</p>}
          {!loadingProducts && !productsError && (!products || products.length === 0) && (<p className="text-light text-center">No se encontraron juegos.</p>)}

          <div className="row g-4 justify-content-center">
            {!loadingProducts && !productsError && (products || []).map((p, i) => (
              <div key={p.id ?? i} className="col-6 col-md-4 col-lg-3">
                <a href={`/product/${p.id}`} className="text-decoration-none text-primary-light">
                  <img src={p.primaryImageUrl || HomeBanner} className="home-product-cover w-100 rounded" alt={p.title || "Videojuego"} />
                  <h6 className="mt-2 mb-0 fw-semibold text-primary-light">{p.title || "Juego sin título"}</h6>
                  <small className="text-primary-light">{p.amountSold ?? 0} ventas</small>
                  {(p.discountPctDisplay ?? 0) > 0 && (<div className="text-success fw-bold small">-{p.discountPctDisplay}% de descuento</div>)}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="home-reveal"><ReviewCarousel /></div>
    </div>
  );
}
