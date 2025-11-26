import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/estilos/Fondos.css";
import HomeBanner from '../assets/homeImage.png';
import Loading from "../assets/doppyKnight/doppyTimeCheck.png";
import ReviewCarousel from "../components/home/ReviewCarousel";
import FeaturedProductsCarousel from "../components/home/FeaturedProductsCarrousel";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchFeaturedCategories, selectFeaturedCategories } from "../redux/slices/categoriesSlice";
import { fetchTopSellers, selectTopSellers } from "../redux/slices/sellersSlice";
import { fetchTopSoldProducts, selectTopSoldProducts } from "../redux/slices/productsSlice";

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [theme] = useState("bg-primary-dark");

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
    if (searchMode && inputRef.current) inputRef.current.focus();
  }, [searchMode]);

  useEffect(() => {
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) setSearchMode(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div data-bs-theme={theme} className="bg-body text-body">
      <div className="position-fixed start-50 translate-middle-x z-2000" style={{ top: '50px', zIndex: 1055 }}>
        <div className="d-inline-flex align-items-center rounded-pill bg-primary-mid bg-opacity-75 p-3 shadow-lg" style={{ backdropFilter: "blur(8px)", minWidth: "280px" }}>
          {!searchMode && (
            <>
              <div className="d-flex align-items-center gap-4 pe-4">
                {icons.map(({ id, icon }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`btn border-0 bg-transparent p-0 text-center transition-all ${ active === id ? "text-primary opacity-100 scale-110" : "text-secondary opacity-50" }`}
                  >
                    <i className={`${icon} fs-3`}></i>
                  </button>
                ))}
              </div>

              <div className="d-flex align-items-center bg-primary rounded-pill px-4 ms-2">
                <button className="btn btn-link text-white fs-5 p-0" onClick={() => setSearchMode(true)}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </>
          )}

          {searchMode && (
            <div className="flex-grow-1 d-flex align-items-center px-2" ref={inputRef}>
              <i className="text-white me-2"></i>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="form-control bg-dark text-light border-0 shadow-sm"
                placeholder="Buscar juegos..."
                style={{ width: "220px" }}
                onKeyDown={(e) => { if (e.key === "Enter") { handleSearch(searchText); setSearchMode(false); } }}
              />
              <button className="btn btn-link text-white ms-2 fs-5" onClick={() => { handleSearch(searchText); setSearchMode(false); }}>
                <i className="fas fa-search"></i>
              </button>
              <button className="btn btn-link text-white ms-2 fs-5" onClick={() => setSearchMode(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="position-relative text-center text-white py-5" style={{ background: (`url(${HomeBanner})`), backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center", minHeight: "70vh" }}>
        <div className="container position-relative py-5">
          <h1 className="display-4 fw-bold py-5">La clave para jugar sin límites</h1>
          <p className="lead mt-3 text-light">Explora miles de juegos para PC, Xbox, PlayStation, y más. Encuentra las mejores ofertas de llaves.</p>
        </div>
      </section>

      <FeaturedProductsCarousel />

      {/* Categories */}
      <section className="py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Categorías Destacadas</h2>
          <div className="row g-4 justify-content-center">
            {loadingCategories && (
              <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "40px" }}>
                <div className="spinner-border text-primary ms-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}><span className="visually-hidden">Loading...</span></div>
                <img src={Loading} alt="Loading..." style={{ width: "120px", height: "160px" }} />
              </div>
            )}

            {!loadingCategories && !categoriesError && (!categories || categories.length === 0) && (
              <p className="text-light">No categories found.</p>
            )}

            {!loadingCategories && !categoriesError && categories.map((cat, i) => (
              <div key={cat.id ?? i} className="col-6 col-md-4 col-lg-2 position-relative overflow-hidden rounded shadow">
                <button type="button" onClick={() => navigate(`/catalog?categoryId=${encodeURIComponent(cat.id)}`)} className="border-0 bg-transparent p-0 text-start w-100" style={{ cursor: "pointer" }}>
                  <img src={HomeBanner} width={80} height={70} className="w-100 rounded" alt={cat.description || cat.name || `Categoria ${cat.id}`} />
                  <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white bg-dark bg-opacity-50 fw-bold">
                    {cat.description || cat.name || `Categoria ${cat.id}`}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Vendedores Más Elegidos</h2>
          <div className="row g-5 justify-content-center">
            {loadingSellers && (
              <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "40px" }}>
                <div className="spinner-border text-primary ms-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}><span className="visually-hidden">Loading...</span></div>
                <img src={Loading} alt="Loading..." style={{ width: "120px", height: "160px" }} />
              </div>
            )}

            {sellersError && (<p className="text-danger">Error: {sellersError}</p>)}

            {!loadingSellers && !sellersError && (!sellers || sellers.length === 0) && (<p className="text-light">No sellers found.</p>)}

            {!loadingSellers && !sellersError && sellers.map((seller, i) => (
              <div key={seller.id ?? i} className="col-6 col-md-3 text-center">
                <a href={`/seller-detail/${seller.id}`} className="text-decoration-none text-body text-primary-light">
                  <img src={seller.avatarDataUrl || "/src/assets/react.svg"} className="rounded-circle border border-primary border-3 mb-3" width="160" height="160" alt={seller.displayName} />
                  <h5 className="text-light fw-bold">{seller.displayName}</h5>
                  <small className="text-light">{seller.amountSold} keys sold • {((seller.avgRating ?? 0) / 2).toFixed(1)}★</small>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Bought Products */}
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">Llaves Más Elegidas</h2>

          {loadingProducts && (
            <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: "40px" }}>
              <div className="spinner-border text-primary ms-3" role="status" style={{ width: "1.5rem", height: "1.5rem" }}><span className="visually-hidden">Loading...</span></div>
              <img src={Loading} alt="Loading..." style={{ width: "120px", height: "160px" }} />
            </div>
          )}
          {productsError && <p className="text-danger text-center">Error: {productsError}</p>}
          {!loadingProducts && !productsError && (!products || products.length === 0) && (<p className="text-light text-center">No games found.</p>)}

          <div className="row g-4 justify-content-center">
            {!loadingProducts && !productsError && (products || []).map((p, i) => (
              <div key={p.id ?? i} className="col-6 col-md-4 col-lg-3">
                <a href={`/product/${p.id}`} className="text-decoration-none text-primary-light">
                  <img src={p.primaryImageUrl || HomeBanner} className="w-100 rounded" alt={p.title || "Game"} />
                  <h6 className="mt-2 mb-0 fw-semibold text-primary-light">{p.title || "Unnamed"}</h6>
                  <small className="text-muted text-primary">{p.category?.description || "Game"} • Sold: {p.amountSold ?? 0}</small>
                  {(p.discountPctDisplay ?? 0) > 0 && (<div className="text-success fw-bold small">-{p.discountPctDisplay}% off</div>)}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ReviewCarousel />
    </div>
  );
}
