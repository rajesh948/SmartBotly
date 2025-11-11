import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateAndFetchUser, clearUser } from '../redux/slices/userSlice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);
  const hasValidated = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    // Only call validate if we have a token, no user data, not already loading, and haven't validated yet
    if (token && !user && !loading && !hasValidated.current) {
      hasValidated.current = true;
      // Token exists, validate it and fetch user data
      dispatch(validateAndFetchUser()).unwrap().catch((error) => {
        // Token is invalid, clear everything
        console.error('Token validation failed:', error);
        localStorage.clear();
        dispatch(clearUser());
      });
    }
  }, [dispatch, user, loading]);

  const logout = () => {
    localStorage.clear();
    dispatch(clearUser());
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
