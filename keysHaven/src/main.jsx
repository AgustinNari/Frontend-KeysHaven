import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import { CartProvider } from './store/cart.jsx';

import { Provider } from 'react-redux';
import store from './redux/store';
import { fetchProfileThunk } from './redux/slices/authSlice';

const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
if (token) {
  store.dispatch(fetchProfileThunk());
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);



// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//       <BrowserRouter>
//         <AuthProvider>
//           <CartProvider>
//             <App />
//           </CartProvider>
//         </AuthProvider>
//       </BrowserRouter>
//   </StrictMode>
// );
