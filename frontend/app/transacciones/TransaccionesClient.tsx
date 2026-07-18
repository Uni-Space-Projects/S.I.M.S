"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Transaction } from "./types";
import TransaccionCard from "./components/TransaccionCard";
import Link from "next/link";

export default function TransaccionesClient() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendiente" | "completada" | "cancelada/rechazada">("pendiente");

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
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">No autorizado</h2>
        <p className="mt-2 text-gray-600">
          Debes iniciar sesión para ver tus transacciones.
        </p>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "pendiente") return t.estado === "pendiente";
    if (filter === "completada") return t.estado === "completada";
    return t.estado === "cancelada" || t.estado === "rechazada";
  });

  const activeCount = transactions.filter(t => t.estado === "pendiente").length;
  const completedCount = transactions.filter(t => t.estado === "completada").length;
  const rejectedCount = transactions.filter(t => t.estado === "cancelada" || t.estado === "rechazada").length;

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Header aligned with mockup */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gestión de Transacciones
          </h1>
          <p className="mt-1 text-gray-500">
            Monitoreo y aprobación de intercambios de insumos médicos.
          </p>
        </div>

        <Link
          href="/inicio"
          className="rounded-lg bg-[#004e98] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003a73] transition"
        >
          + Nueva Solicitud de Trueque
        </Link>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Lado Izquierdo: Lista principal */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="mb-6 flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setFilter("pendiente")}
              className={`pb-3 text-sm font-semibold transition-colors ${
                filter === "pendiente"
                  ? "border-b-2 border-blue-600 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Solicitudes ({activeCount})
            </button>
            <button
              onClick={() => setFilter("completada")}
              className={`pb-3 text-sm font-semibold transition-colors ${
                filter === "completada"
                  ? "border-b-2 border-blue-600 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Completadas ({completedCount})
            </button>
            <button
              onClick={() => setFilter("cancelada/rechazada")}
              className={`pb-3 text-sm font-semibold transition-colors ${
                filter === "cancelada/rechazada"
                  ? "border-b-2 border-blue-600 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Rechazadas/Canceladas ({rejectedCount})
            </button>
          </div>

          {/* Listado de transacciones */}
          <div className="flex flex-col gap-4">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <svg
                  className="mb-4 h-12 w-12 text-gray-300"
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
                <h3 className="text-base font-medium text-gray-900">
                  No hay transacciones
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no tienes solicitudes en esta categoría.
                </p>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <TransaccionCard
                  key={t.id}
                  transaction={t}
                  currentUserId={user.id}
                  onUpdate={fetchTransactions}
                />
              ))
            )}
          </div>
        </div>

        {/* Lado Derecho: Sidebar Resumen */}
        <div className="w-full shrink-0 lg:w-[320px]">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">
              Resumen de Actividad
            </h3>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Solicitudes Activas
                </span>
                <span className="flex h-6 w-8 items-center justify-center rounded bg-blue-100/50 text-xs font-bold text-blue-600">
                  {activeCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Completadas
                </span>
                <span className="flex h-6 w-8 items-center justify-center rounded bg-green-100/50 text-xs font-bold text-green-600">
                  {completedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Requieren Atención
                </span>
                <span className="flex h-6 w-8 items-center justify-center rounded bg-red-100/50 text-xs font-bold text-red-600">
                  {rejectedCount}
                </span>
              </div>
            </div>
            <button className="mt-6 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              Ver Reporte Completo
            </button>
          </div>

          <div className="mt-6 flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
             <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
             </svg>
             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Gráfico de Volumen Mensual</p>
          </div>
        </div>
      </div>
    </div>
  );
}
