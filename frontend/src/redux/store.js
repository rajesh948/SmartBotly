import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './slices/clientsSlice';
import userReducer from './slices/userSlice';
import productsReducer from './slices/productsSlice';

const store = configureStore({
  reducer: {
    clients: clientsReducer,
    user: userReducer,
    products: productsReducer,
  },
});

export default store;
