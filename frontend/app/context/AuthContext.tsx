"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: "admin" | "user" | "suspend";
}

interface AuthContextType {
  user: User | null;
  role: "admin" | "user" | "suspend" | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Si el usuario no existe en la BD, limpiar sesión
        localStorage.removeItem("sims_user_id");
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user session details:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("sims_user_id");
      if (storedUserId) {
        // En Next.js, localStorage a veces puede almacenar '"undefined"' si no se valida
        try {
          const parsedId = JSON.parse(storedUserId);
          if (parsedId) {
            setLoading(true);
            await fetchUser(parsedId.toString());
            return;
          }
        } catch {
          // Si no es JSON válido
          setLoading(true);
          await fetchUser(storedUserId);
          return;
        }
      }
    }
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshUser();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshUser]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sims_user_id");
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.rol : null,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
