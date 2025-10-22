import React, { useState, useRef, useEffect } from "react";
import "../components/estilos/Fondos.css";
import { getFeaturedCategories } from '../api/categories';
import { getTopSellers } from "../api/sellers";
import HomeBanner from '/src/assets/homeImage.png';

export default function Home() {
  const [theme, setTheme] = useState("bg-primary-dark");
  
  //Categories Variables
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  
  //Sellers Variables
  const [sellers, setSellers] = useState([]);
  
  //Mininavbar Variables
  const inputRef = useRef(null);
  const [searchMode, setSearchMode] = useState(false);
  const [active, setActive] = useState("pc");
  const icons = [
    { id: "pc", icon: "fab fa-windows" },
    { id: "ps", icon: "fab fa-playstation" },
    { id: "xbox", icon: "fab fa-xbox" },
    { id: "switch", icon: "fas fa-gamepad" },
  ];

  useEffect(() => {
    getTopSellers()
      .then(data => setSellers(data.content))
      .catch(err => console.error("Failed to load sellers", err));
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch("/api/categories/featured?page=0&size=5");  // adjust URL as needed
        if (!response.ok) {
          throw new Error(`Error fetching categories: ${response.statusText}`);
        }
        const page = await response.json();
        // page.content is the list (assuming standard Spring Page structure) :contentReference[oaicite:0]{index=0}
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

  useEffect(() => {
    if (searchMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchMode]);

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
            <i className="fas fa-search text-white me-2"></i>
            <input
              type="text"
              className="form-control bg-dark text-light border-0 shadow-sm"
              placeholder="Buscar juegos..."
              style={{ width: "220px" }}
            />
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
          <h1 className="display-4 fw-bold">Unlock Your Next Adventure</h1>
          <p className="lead mt-3 text-light">
            Explore thousands of games for PC, Xbox, PlayStation, and more. Find the best deals on digital keys and subscriptions.
          </p>
        </div>
      </section>

      {/* Categories */}
            <section className="py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Top Categories</h2>
          <div className="row g-4 justify-content-center">
            {loadingCategories && <p className="text-light">Loading categories…</p>}
            {categoriesError && <p className="text-danger">Error: {categoriesError}</p>}
            {!loadingCategories && !categoriesError && categories.length === 0 && (
              <p className="text-light">No categories found.</p>
            )}
            {!loadingCategories && !categoriesError && categories.map((cat) => (
              <div
                key={cat.id}
                className="col-6 col-md-4 col-lg-2 position-relative overflow-hidden rounded shadow"
              >
                <img
                  src={cat.imageUrl ?? "/src/assets/keyLogo.svg"}
                  width={80}
                  height={70}
                  className="w-100 rounded"
                  alt={cat.name}
                />
                <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white bg-dark bg-opacity-50 fw-bold">
                  {cat.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-5 bg-primary-dark">
        <div className="container text-center">
          <h2 className="fw-bold mb-5 text-primary-light">Top Sellers</h2>
          <div className="row g-5 justify-content-center">
            {sellers.map((seller, i) => (
              <div key={seller.id || i} className="col-6 col-md-3">
                <a href={`"/seller-detail/${seller.id}`} className="text-decoration-none text-body text-primary-light">
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
          <h2 className="fw-bold text-center mb-5 text-primary-light">Most Sold Games</h2>
          <div className="row g-4 justify-content-center">
            {loadingProducts && <p className="text-light text-center">Loading games…</p>}
            {productsError && <p className="text-danger text-center">{productsError}</p>}
            {!loadingProducts && topProducts.length === 0 && (
              <p className="text-light text-center">No top products found.</p>
            )}
            {!loadingProducts &&
              topProducts.map((product) => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <a href={`/product/${product.id}`} className="text-decoration-none">
                    <img
                      src={product.primaryImageUrl ?? HomeBanner}
                      className="w-100 rounded"
                      alt={product.title}
                    />
                    <h6 className="mt-2 mb-0 fw-semibold text-primary-light">{product.title}</h6>
                    <small className="text-muted text-primary">
                      {product.categories ?? ""} • {product.amountSold ?? 0} sold
                    </small>
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

