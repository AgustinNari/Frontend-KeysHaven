
import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import productsReducer from './slices/productsSlice.js';
import productDetailReducer from './slices/productDetailSlice.js';
import reviewsReducer from './slices/reviewsSlice.js';
import categoriesReducer from './slices/categoriesSlice.js';
import discountsReducer from './slices/discountsSlice.js';
import sellersReducer from './slices/sellersSlice.js';
import sellerPanelReducer from './slices/sellerPanelSlice.js';
import adminPanelReducer from './slices/adminPanelSlice.js';
import ordersReducer from './slices/ordersSlice.js';
import profileReducer from './slices/profileSlice.js';


const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productsReducer,
        productDetail: productDetailReducer,
        reviews: reviewsReducer,
        categories: categoriesReducer,
        discounts: discountsReducer,
        sellers: sellersReducer,
        sellerPanel: sellerPanelReducer,
        adminPanel: adminPanelReducer,
        orders: ordersReducer,
        profile: profileReducer
        },

});

export default store;