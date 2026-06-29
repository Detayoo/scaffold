"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import type { User } from "@/types";
import { decrypt, encrypt } from "@/utils/encryption";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

interface AdminAuthContextType {
  loading: boolean;
  token: string | null;
  user: User | null;
  setUser: (payload: User) => void;
  setToken: (payload: string) => void;
  logout: () => void;
}

const initialState: AdminAuthContextType = {
  loading: true,
  token: null,
  user: null,
  setUser: () => {},
  setToken: () => {},
  logout: () => {},
};

const AdminAuthContext = createContext<AdminAuthContextType>(initialState);

type Action =
  | { type: "SET-TOKEN"; payload: string }
  | { type: "SET-USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "LOADED" };

function reducer(state: AdminAuthContextType, action: Action): AdminAuthContextType {
  switch (action.type) {
    case "SET-TOKEN":
      return { ...state, token: action.payload };
    case "SET-USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, token: null, user: null, loading: false };
    case "LOADED":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const storedToken = decrypt(localStorage.getItem(TOKEN_KEY) ?? "");
      const storedUser = decrypt(localStorage.getItem(USER_KEY) ?? "");
      if (storedToken) dispatch({ type: "SET-TOKEN", payload: storedToken });
      if (storedUser) dispatch({ type: "SET-USER", payload: JSON.parse(storedUser) });
    } catch {}
    dispatch({ type: "LOADED" });
  }, []);

  const setToken = (payload: string) => {
    localStorage.setItem(TOKEN_KEY, encrypt(payload));
    dispatch({ type: "SET-TOKEN", payload });
  };

  const setUser = (payload: User) => {
    localStorage.setItem(USER_KEY, encrypt(JSON.stringify(payload)));
    dispatch({ type: "SET-USER", payload });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AdminAuthContext.Provider value={{ ...state, setToken, setUser, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
