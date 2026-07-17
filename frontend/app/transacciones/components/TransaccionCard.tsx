import React, { useState } from "react";
import { Transaction } from "../types";
import TransaccionDetailModal from "./TransaccionDetailModal";

interface Props {
  transaction: Transaction;
  currentUserId: number;
  onUpdate: () => void;
}

export default function TransaccionCard({ transaction, currentUserId, onUpdate }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determinar qué da y qué recibe el usuario actual
  const doy = transaction.detalles.find((d) => d.usuarioEmisor?.id === currentUserId);
  const recibo = transaction.detalles.find((d) => d.usuarioReceptor?.id === currentUserId);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completada":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelada":
      case "rechazada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleBadge = () => {
    // Si la transacción fue iniciada por mí (yo doy y pido a cambio)
    // Para simplificar, si yo soy el que inició el trueque, mi registro se envió como el que solicita
    // Asumiremos que el "Emisor" del primer detalle de la lista es el que inició.
    const isIniciador = transaction.detalles[0]?.usuarioEmisor?.id === currentUserId;
    return isIniciador ? (
      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Enviada por mí</span>
    ) : (
      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Recibida</span>
    );
  };

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200 transition-all hover:shadow-md">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                transaction.estado
              )}`}
            >
              {transaction.estado}
            </span>
            {getRoleBadge()}
          </div>
          <span className="text-xs text-gray-500">
            {new Date(transaction.fecha_transaccion).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-4">
            {/* Lo que doy */}
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                Ofreces
              </span>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 shadow-inner">
                <span className="text-2xl">📦</span>
              </div>
              <span className="mt-3 text-sm font-semibold text-gray-900 line-clamp-1">
                {doy ? doy.publicacion.name : "N/A"}
              </span>
              <span className="text-xs text-gray-500">Cant: {doy ? doy.cantidad : 0}</span>
            </div>

            {/* Icono de intercambio */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                  />
                </svg>
              </div>
            </div>

            {/* Lo que recibo */}
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                Recibes
              </span>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-50 border border-green-100 shadow-inner">
                <span className="text-2xl">🎁</span>
              </div>
              <span className="mt-3 text-sm font-semibold text-gray-900 line-clamp-1">
                {recibo ? recibo.publicacion.name : "N/A"}
              </span>
              <span className="text-xs text-gray-500">Cant: {recibo ? recibo.cantidad : 0}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TransaccionDetailModal
          transaction={transaction}
          currentUserId={currentUserId}
          onClose={() => setIsModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
