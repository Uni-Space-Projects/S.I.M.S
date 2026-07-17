"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Transaction } from "./types";
import TransaccionCard from "./components/TransaccionCard";

export default function TransaccionesClient() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todas" | "pendiente" | "completada" | "cancelada" | "rechazada">("todas");

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/transactions");
      if (res.ok) {
        const data: Transaction[] = await res.json();
        // Filtrar transacciones en las que el usuario actual participe
        const misTransacciones = data.filter((t) =>
          t.detalles?.some(
            (d) =>
              d.usuarioEmisor?.id === user.id ||
              d.usuarioReceptor?.id === user.id
          )
        );
        // Ordenar por fecha más reciente
        misTransacciones.sort(
          (a, b) =>
            new Date(b.fecha_transaccion).getTime() -
            new Date(a.fecha_transaccion).getTime()
        );
        setTransactions(misTransacciones);
      }
    } catch (error) {
      console.error("Error al obtener transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchTransactions();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">No autorizado</h2>
        <p className="mt-2 text-gray-600">
          Debes iniciar sesión para ver tus transacciones.
        </p>
      </div>
    );
  }

  const filteredTransactions =
    filter === "todas"
      ? transactions
      : transactions.filter((t) => t.estado === filter);

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mis Transacciones
          </h1>
          <p className="mt-1 text-gray-500">
            Gestiona tus solicitudes de trueque e intercambios.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {["todas", "pendiente", "completada", "rechazada", "cancelada"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tablero de Transacciones */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <svg
            className="mb-4 h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">
            No hay transacciones
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron transacciones en este estado.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTransactions.map((t) => (
            <TransaccionCard
              key={t.id}
              transaction={t}
              currentUserId={user.id}
              onUpdate={fetchTransactions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
