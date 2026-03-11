import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import Api from '../services/api';

const AuthContext = createContext();

const TOKEN_KEY = 'auth_token_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted token
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          Api.setToken(stored);
          try {
            const me = await Api.me();
            if (me?.success) setUser(me.user);
          } catch (e) {
            console.warn('Token invalid, clearing');
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveAuth = useCallback(async (tok, usr) => {
    setToken(tok);
    Api.setToken(tok);
    await SecureStore.setItemAsync(TOKEN_KEY, tok);
    setUser(usr);
  }, []);

  const register = useCallback(async ({ name, email, phone, password }) => {
    const res = await Api.register({ name, email, phone, password });
    if (res.success) await saveAuth(res.token, res.user);
    return res;
  }, [saveAuth]);

  const login = useCallback(async ({ email, phone, password }) => {
    const res = await Api.login({ email, phone, password });
    if (res.success) await saveAuth(res.token, res.user);
    return res;
  }, [saveAuth]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    Api.setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){ return useContext(AuthContext); }
