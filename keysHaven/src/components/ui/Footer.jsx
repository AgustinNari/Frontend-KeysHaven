import React from 'react';

export default function Footer() {
  return (
    <footer className="border-top py-5 bg-primary-mid text-light">
      <div className="container app-container text-center">
        <div className="row g-4">
          <div className="col-md-3">
            <a href="#" className="d-flex align-items-center gap-2 mb-3 text-decoration-none text-light">
              <img src="/src/assets/keyLogo.svg" width={55} height={50} />
              <strong>Key Haven</strong>
            </a>
            <small className="text-light">© 2025 Key Haven. All rights reserved.</small>
          </div>
          <div className="col-md-2">
            <h6 className="fw-bold">Support</h6>
            <ul className="list-unstyled small">
              <li><a href="#" className="text-light text-decoration-none">Activate Keys</a></li>
              <li><a href="#" className="text-light text-decoration-none">Refund Policy</a></li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="fw-bold">Company</h6>
            <ul className="list-unstyled small">
              <li><a href="#" className="text-light text-decoration-none">Terms of Service</a></li>
              <li><a href="#" className="text-light text-decoration-none">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
