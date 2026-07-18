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

  const doy = transaction.detalles.find((d) => d.usuarioEmisor?.id === currentUserId);
  const recibo = transaction.detalles.find((d) => d.usuarioReceptor?.id === currentUserId);
  
  const isIniciador = transaction.detalles[0]?.usuarioEmisor?.id === currentUserId;

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 tracking-wider uppercase">Solicitud Pendiente</span>;
      case "completada":
        return <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold text-green-600 tracking-wider uppercase">Completada</span>;
      case "cancelada":
      case "rechazada":
        return <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold text-red-600 tracking-wider uppercase">{estado}</span>;
      default:
        return null;
    }
  };

  const getBorderColor = (estado: string) => {
    switch (estado) {
      case "pendiente": return "border-l-gray-300";
      case "completada": return "border-l-green-400";
      default: return "border-l-red-400";
    }
  };

  // Main item to show as title: What I want to receive
  const title = recibo ? recibo.publicacion.name : (doy ? doy.publicacion.name : "Insumo");
  const units = recibo ? recibo.cantidad : 0;
  
  // Who am I trading with?
  const otherUser = recibo ? `${recibo.usuarioEmisor.nombre} ${recibo.usuarioEmisor.apellido}` : (doy ? `${doy.usuarioReceptor.nombre} ${doy.usuarioReceptor.apellido}` : "Usuario");

  return (
    <>
      <div className={`flex flex-col rounded-xl border-l-[6px] ${getBorderColor(transaction.estado)} border-y border-r border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:justify-between`}>
        
        {/* Left Side: Info */}
        <div className="flex flex-col items-start gap-3">
          {getStatusBadge(transaction.estado)}
          
          <div>
            <h4 className="text-xl font-bold text-gray-900">{title}</h4>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(transaction.fecha_transaccion).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">
              {otherUser.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{otherUser}</span>
            {isIniciador ? (
              <span className="ml-2 text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Enviada por mí</span>
            ) : (
              <span className="ml-2 text-[10px] font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Recibida</span>
            )}
          </div>
        </div>

        {/* Right Side: Units and Action */}
        <div className="mt-4 flex w-full flex-row items-end justify-between border-t border-gray-100 pt-4 md:mt-0 md:w-auto md:flex-col md:items-end md:border-none md:pt-0">
          <div className="text-right">
             <div className="text-3xl font-bold text-blue-600">{units}</div>
             <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Unidades</div>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            Ver Detalle
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
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
