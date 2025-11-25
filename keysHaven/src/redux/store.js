
import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice.js';
import sellerDetailReducer from './slices/sellerDetailSlice.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
        sellerDetail: sellerDetailReducer,
    },
});

export default store;