import React, { useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const next = theme === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-bs-theme", next);
  };

  return (
    <div data-bs-theme={theme} className="bg-body text-body">
      {/* Navbar */}
      

      {/* Hero */}
      <section
        className="position-relative text-center text-white py-5"
        style={{
          background:
            "linear-gradient(to top, rgba(25,16,34,0.9), rgba(25,16,34,0)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaLqo7r6x1c0zdbnYfCjgTUx2iQlmvRVF13Jy_eX-DXIf8T6isuDaOmA6AVHGye2Ao1fHuktJNZgBZ2grx1PtGZk4rjYkMPzhzla0viv4-8hKkuXOn-5vSirvm0T7Mqzh6utt_G14sc36bN1T6rPGDBrC73E-5ZWmkCTj1AWCQCy2V1Q6bXjewdDVSjs35NkHPcwIukMLKhQUyetfnZ9eCJ2zN1C0zSZOtrZ0TiCl1MdzrVESZUNX38zstzSzjMLqGiHkFOWhU2zw')",
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
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">Top Categories</h2>
          <div className="row g-4 justify-content-center">
            {["PC Games", "Xbox", "PlayStation", "Gift Cards", "Subscriptions"].map((cat) => (
              <div
                key={cat}
                className="col-6 col-md-4 col-lg-2 position-relative overflow-hidden rounded shadow"
              >
                <img
                  src="https://via.placeholder.com/300x200"
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
      <section className="py-5 bg-body-secondary">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">Top Sellers</h2>
          <div className="row g-5 justify-content-center">
            {["SellerOne", "GameStoreX", "PlayHub", "KeyWorld"].map((seller) => (
              <div key={seller} className="col-6 col-md-3">
                <a href="#" className="text-decoration-none text-body">
                  <img
                    src="https://via.placeholder.com/160"
                    className="rounded-circle border border-primary border-3 mb-3"
                    width="160"
                    height="160"
                    alt={seller}
                  />
                  <h5>{seller}</h5>
                  <small className="text-muted">12,345 keys • 4.8★</small>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Best Sellers</h2>
          <div className="row g-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="col-6 col-md-4 col-lg-3">
                <img
                  src="https://via.placeholder.com/300x400"
                  className="w-100 rounded"
                  alt={`Game ${i + 1}`}
                />
                <h6 className="mt-2 mb-0 fw-semibold">Game Title {i + 1}</h6>
                <small className="text-muted">Action</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-top py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-3">
              <a
                href="#"
                className="d-flex align-items-center gap-2 mb-3 text-decoration-none text-body"
              >
                <svg width="32" height="32" fill="currentColor" className="text-primary">
                  <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" />
                </svg>
                <strong>Key Haven</strong>
              </a>
              <small className="text-muted">© 2025 Key Haven. All rights reserved.</small>
            </div>
            <div className="col-md-2">
              <h6 className="fw-bold">Support</h6>
              <ul className="list-unstyled small">
                <li><a href="#" className="link-body-emphasis text-decoration-none">Activate Keys</a></li>
                <li><a href="#" className="link-body-emphasis text-decoration-none">Refund Policy</a></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6 className="fw-bold">Company</h6>
              <ul className="list-unstyled small">
                <li><a href="#" className="link-body-emphasis text-decoration-none">Terms of Service</a></li>
                <li><a href="#" className="link-body-emphasis text-decoration-none">Privacy Policy</a></li>
              </ul>
            </div>
            <div className="col-md-5">
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

