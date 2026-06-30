"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { Merchant, User } from "@/types";
import { getMerchantProfileFn } from "@/services";
import { decrypt, encrypt } from "@/utils/encryption";

interface AuthContextType {
  loading: boolean;
  token: string | null;
  user: User | null;
  merchant: Merchant | null;
  setUser: (payload: User) => void;
  setToken: (payload: string) => void;
  setMerchant: (payload: Merchant) => void;
  logout: () => void;
  getCredentials: () => void;
}

const initialState: AuthContextType = {
  loading: true,
  token: null,
  user: null,
  merchant: null,
  setUser: () => {},
  setToken: () => {},
  setMerchant: () => {},
  logout: () => {},
  getCredentials: () => {},
};

const AuthContext = createContext<AuthContextType>(initialState);

type Action =
  | { type: "GET-CREDENTIALS" }
  | { type: "SET-TOKEN"; payload: string }
  | { type: "SET-USER"; payload: User }
  | { type: "SET-MERCHANT"; payload: Merchant }
  | { type: "LOGOUT" };

const reducer = (state: AuthContextType, action: Action): AuthContextType => {
  switch (action.type) {
    case "GET-CREDENTIALS": {
      const token = localStorage.getItem("TOKEN") ?? "";
      const user = localStorage.getItem("USER") ?? "";
      const merchant = localStorage.getItem("MERCHANT") ?? "";
      return {
        ...state,
        token: decrypt(token),
        user: user ? JSON.parse(decrypt(user) ?? "null") ?? null : null,
        merchant: merchant
          ? JSON.parse(decrypt(merchant) ?? "null") ?? null
          : null,
        loading: false,
      };
    }
    case "SET-TOKEN":
      localStorage.setItem("TOKEN", encrypt(action.payload));
      return { ...state, token: action.payload };
    case "SET-USER":
      localStorage.setItem("USER", encrypt(JSON.stringify(action.payload)));
      return { ...state, user: action.payload };
    case "SET-MERCHANT":
      localStorage.setItem(
        "MERCHANT",
        encrypt(JSON.stringify(action.payload))
      );
      return { ...state, merchant: action.payload };
    case "LOGOUT":
      localStorage.clear();
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isFetchingMerchant, setIsFetchingMerchant] = useState(false);
  const hasFetchedMerchant = useRef(false);

  useEffect(() => {
    dispatch({ type: "GET-CREDENTIALS" });
  }, []);

  useEffect(() => {
    if (!state?.token) {
      hasFetchedMerchant.current = false;
    }
  }, [state?.token]);

  useEffect(() => {
    if (!state?.token || hasFetchedMerchant.current) return;

    const fetchMerchant = async () => {
      setIsFetchingMerchant(true);
      try {
        const res = await getMerchantProfileFn();
        const latest = res?.data?.merchant;
        if (latest) {
          const merged = state?.merchant
            ? { ...state.merchant, ...latest }
            : latest;
          dispatch({ type: "SET-MERCHANT", payload: merged });
        }
      } catch {
        // merchant profile fetch failed — user can retry on page load
      } finally {
        hasFetchedMerchant.current = true;
        setIsFetchingMerchant(false);
      }
    };

    fetchMerchant();
  }, [state?.token]);

  const contextValues: AuthContextType = {
    loading: state?.loading || isFetchingMerchant,
    token: state?.token,
    user: state?.user,
    merchant: state?.merchant,
    getCredentials: () => dispatch({ type: "GET-CREDENTIALS" }),
    setToken: (payload: string) =>
      dispatch({ type: "SET-TOKEN", payload }),
    setUser: (payload: User) => dispatch({ type: "SET-USER", payload }),
    setMerchant: (payload: Merchant) =>
      dispatch({ type: "SET-MERCHANT", payload }),
    logout: () => dispatch({ type: "LOGOUT" }),
  };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
