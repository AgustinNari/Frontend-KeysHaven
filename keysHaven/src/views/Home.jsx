import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../components/estilos/Fondos.css";
import { getFeaturedCategories } from '../services/categories';
import { getTopSellers } from "../services/sellers";
import productsService from "../services/productsService";
import HomeBanner from '/src/assets/homeImage.png';

export default function Home() {
  const [theme, setTheme] = useState("bg-primary-dark");
  
  //Categories Variables
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  
  //Sellers Variables
  const [sellers, setSellers] = useState([]);

  // Products Variables
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  
  //MiniNavBar Variables
  const inputRef = useRef(null);
  const [searchMode, setSearchMode] = useState(false);
  const [active, setActive] = useState("pc");
  const icons = [
    { id: "pc", icon: "fab fa-windows" },
    { id: "ps", icon: "fab fa-playstation" },
    { id: "xbox", icon: "fab fa-xbox" },
    { id: "switch", icon: "fas fa-gamepad" },
  ];
  const navigate = useNavigate();
  const handleSearch = (term) => {
    const query = term.trim();
    if (query.length > 0) {
      navigate(`/catalog?title=${encodeURIComponent(query)}`);
    } else {
      navigate(`/catalog`);
    }
  };
  const [searchText, setSearchText] = useState("");

  //Seller
  useEffect(() => {
    getTopSellers()
      .then(data => setSellers(data.content))
      .catch(err => console.error("Failed to load sellers", err));
  }, []);

  //Category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const page = await getFeaturedCategories(0, 5);
        const fetchedCats = page.content || [];
        setCategories(fetchedCats);
      } catch (err) {
        console.error(err);
        setCategoriesError(err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  //Product
  useEffect(() => {
    const fetchTopSold = async () => {
      try {
        setLoadingProducts(true);
        const page = await productsService.getTopSoldProducts(4);
        const fetched = page.content || [];
        setProducts(fetched);
      } catch (err) {
        console.error("Failed to load top sold products", err);
        setProductsError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchTopSold();
  }, []);

  //MiniNavBar
  useEffect(() => {
    if (searchMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchMode]);

  //SearchBar
  useEffect(() => {
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setSearchMode(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
  }, []);

  return (
    <div data-bs-theme={theme} className="bg-body text-body">

      <div
      className="position-fixed start-50 translate-middle-x z-2000"
      style={{ top: '50px', zIndex: 1055 }}
    >
      <div
        className="d-inline-flex align-items-center rounded-pill bg-primary-mid bg-opacity-75 p-3 shadow-lg"
        style={{ backdropFilter: "blur(8px)", minWidth: "280px" }}
      >
        {!searchMode && (
          <>
            <div className="d-flex align-items-center gap-4 pe-4">
              {icons.map(({ id, icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`btn border-0 bg-transparent p-0 text-center transition-all ${
                    active === id
                      ? "text-primary opacity-100 scale-110"
                      : "text-secondary opacity-50"
                  }`}
                >
                  <i className={`${icon} fs-3`}></i>
                </button>
              ))}
            </div>

            <div className="d-flex align-items-center bg-primary rounded-pill px-4 ms-2">
              <button
                className="btn btn-link text-white fs-5 p-0"
                onClick={() => setSearchMode(true)}
              >
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchText);
                  setSearchMode(false);
                }
              }}
            />
            <button
              className="btn btn-link text-white ms-2 fs-5"
              onClick={() => {
                handleSearch(searchText);
                setSearchMode(false);
              }}
            >
              <i className="fas fa-search"></i>
            </button>
            <button
              className="btn btn-link text-white ms-2 fs-5"
              onClick={() => setSearchMode(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Hero */}
      <section
        className="position-relative text-center text-white py-5"
        style={{
          background:
            ("linear-gradient(to top, rgba(25,16,34,0.9), rgba(25,16,34,0)), url('/src/assets/homeImage.png')"),
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "70vh",
        }}
      >
        <div className="container position-relative py-5">
          <h1 className="display-4 fw-bold py-5">La clave para jugar sin límites</h1>
          <p className="lead mt-3 text-light">
            Explora miles de juegos para PC, Xbox, PlayStation, y más. Encuentra las mejores ofertas de llaves.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Categorías Destacadas</h2>
          <div className="row g-4 justify-content-center">
            {loadingCategories && <p className="text-light">Cargando categorías…</p>}
            {categoriesError && <p className="text-danger">Error: {categoriesError}</p>}
            {!loadingCategories && !categoriesError && categories.length === 0 && (
              <p className="text-light">No categories found.</p>
            )}
            {!loadingCategories && !categoriesError && categories.map((cat) => (
              <div
                key={cat.id || i}
                className="col-6 col-md-4 col-lg-2 position-relative overflow-hidden rounded shadow"
              ><button
                type="button"
                onClick={() => navigate(`/catalog?categoryId=${encodeURIComponent(cat.id)}`)}
                className="border-0 bg-transparent p-0 text-start w-100"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={HomeBanner}
                  width={80}
                  height={70}
                  className="w-100 rounded"
                  alt={cat.description || cat.descripion || `Categoria ${cat.id}`}
                />
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
          <h2 className="fw-bold mb-5 text-primary-light">Vendedores más Elegidos</h2>
          <div className="row g-5 justify-content-center">
            {sellers.map((seller, i) => (
              <div key={seller.id || i} className="col-6 col-md-3">
                <a href={`/seller-detail/${seller.id}`} className="text-decoration-none text-body text-primary-light">
                  <img
                    src={seller.avatarDataUrl || "/src/assets/react.svg"}
                    className="rounded-circle border border-primary border-3 mb-3"
                    width="160"
                    height="160"
                    alt={seller.displayName}
                  />
                  <h5>{seller.displayName}</h5>
                  <small className="text-light">{seller.amountSold} keys sold • {seller.avgRating}★</small>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Bought Products */}
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">Llaves más Elegidas</h2>

          {loadingProducts && <p className="text-light text-center">Cargando juegos...</p>}
          {productsError && <p className="text-danger text-center">Error: {productsError}</p>}
          {!loadingProducts && !productsError && products.length === 0 && (
            <p className="text-light text-center">No games found.</p>
          )}

          <div className="row g-4 justify-content-center">
            {!loadingProducts && !productsError && products.map((p, i) => (
              <div key={p.id || i} className="col-6 col-md-4 col-lg-3">
                <a href={`/product/${p.id}`} className="text-decoration-none text-primary-light">
                  <img
                    src={p.primaryImageUrl || HomeBanner}
                    className="w-100 rounded"
                    alt={p.title || "Game"}
                  />
                  <h6 className="mt-2 mb-0 fw-semibold text-primary-light">{p.title || "Unnamed"}</h6>
                  <small className="text-muted text-primary">
                    {p.category?.description || "Game"} • Sold: {p.amountSold ?? 0}
                  </small>
                  {p.discountPctDisplay > 0 && (
                    <div className="text-success fw-bold small">
                      -{p.discountPctDisplay}% off
                    </div>
                  )}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

//Esto es una Barra de Texto para escribir, con la leyenda "Subscribe for the latest deals" y un botón de "Subscribe"
//no lo borré pq me pareció una buena cosa para tener si queremos copiar
/*<div className="col-md-5">
              <h6 className="fw-bold">Stay Connected</h6>
              <p className="small text-muted">Subscribe for the latest deals.</p>
              <form className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                />
                <button className="btn btn-primary">Subscribe</button>
              </form>
            </div>*/

  /*const toggleTheme = () => {
    const next = theme === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-bs-theme", next);
  };*/

