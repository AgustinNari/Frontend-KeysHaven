import React from 'react';

export default function Login() {
  return (
    <div className='container-fluid bg-dark text-white d-flex justify-content-center align-items-center ' style={{height: '100vh'}}>

      <div className='row'>

        <div className='border border-white bg-primary'>
          <h2 className='text-center'>Login</h2>
          <div className="row full-height d-flex flex-column align-items-center justify-content-center p-2" style={{width: '100vw'}}>
            <div className="card p-3  ms-4" style={{ maxWidth: '40%' }}>
              <input className="form-control mb-2" placeholder="E-mail" />
              <input className="form-control mb-3" placeholder="Contraseña" type="password" />
              <label className="form-label">Al continuar aceptas nuestros terminos y condiciones, al igual que nuestras
                politicas de privacidad.</label>
              <button className="btn btn-primary">Ingresar (demo)</button>
            </div>
          </div>
        </div>
      </div>
    </div>


  );
}
