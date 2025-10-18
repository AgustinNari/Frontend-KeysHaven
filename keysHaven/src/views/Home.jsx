import React, { useState } from "react";
import "../components/estilos/Fondos.css";
import HomeBanner from '/src/assets/homeImage.png'
export default function Home() {
  const [theme, setTheme] = useState("bg-primary-dark");

  /*const toggleTheme = () => {
    const next = theme === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-bs-theme", next);
  };*/

  return (
    <div data-bs-theme={theme} className="bg-body text-body">     

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
            {["PC Games", "Xbox", "PlayStation", "Gift Cards", "Subscriptions"].map((cat) => (
              <div
                key={cat}
                className="col-6 col-md-4 col-lg-2 position-relative overflow-hidden rounded shadow"
              >
                <img
                  src="/src/assets/keyLogo.svg" width={80} height={70}
                  className="w-100 rounded"
                  alt={cat}
                />
                <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white bg-dark bg-opacity-50 fw-bold">
                  {cat}
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
            {["ProductOne", "GameStoreX", "PlayHub", "KeyWorld"].map((seller) => (
              <div key={seller} className="col-6 col-md-3">
                <a href="product/1" className="text-decoration-none text-body text-primary-light">
                  <img
                    src="/src/assets/react.svg"
                    className="rounded-circle border border-primary border-3 mb-3"
                    width="160"
                    height="160"
                    alt={seller}
                  />
                  <h5>{seller}</h5>
                  <small className="text-light">12,345 keys • 4.8★</small>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-5 bg-primary-dark">
        <div className="container">
          <h2 className="fw-bold text-center mb-5 text-primary-light">Best Sellers</h2>
          <div className="row g-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <img
                  src="/src/assets/homeImage.svg"
                  className="w-100 rounded"
                  alt={`Game ${i + 1}`}
                />
                <h6 className="mt-2 mb-0 fw-semibold text-primary-light">Game Title {i + 1}</h6>
                <small className="text-muted">Action</small>
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

