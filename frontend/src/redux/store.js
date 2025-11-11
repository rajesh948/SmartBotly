import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './slices/clientsSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    clients: clientsReducer,
    user: userReducer,
  },
});

export default store;
