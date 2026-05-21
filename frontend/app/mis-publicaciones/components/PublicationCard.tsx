import React from "react";
import { PublicacionInsumo } from "../types";

interface PublicationCardProps {
  publication: PublicacionInsumo;
  onViewDetails: (pub: PublicacionInsumo) => void;
}

export default function PublicationCard({
  publication,
  onViewDetails,
}: PublicationCardProps) {
  const { name, lote, expirationDate, isActive } = publication;

  // Formatear la fecha para que no muestre la hora (ej. 2026-10-28T00:00:00.000Z -> 2026-10-28)
  const formattedDate = expirationDate.split("T")[0];

  // Determinar si está vencido o a punto de vencer (comparar con la fecha actual del sistema)
  const isExpiredOrClose = () => {
    try {
      const expirationDateObj = new Date(expirationDate);
      const today = new Date();
      // Eliminar horas de la comparación para precisión de fechas
      today.setHours(0, 0, 0, 0);
      expirationDateObj.setHours(0, 0, 0, 0);

      // Si ya pasó la fecha o vence en los próximos 30 días, activar alerta
      const timeDiff = expirationDateObj.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      return daysDiff <= 30;
    } catch {
      return false;
    }
  };

  const hasAlert = isActive && isExpiredOrClose();

  if (!isActive) {
    return (
      <article
        onClick={() => onViewDetails(publication)}
        className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 opacity-70 hover:opacity-100 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{name}</h2>
          <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-2 py-1 rounded-full border border-outline-variant flex items-center gap-1 font-semibold">
            CERRADO
          </span>
        </div>
        <div className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
          <div className="flex justify-between border-b border-surface-container-high pb-2">
            <span>Lote</span>
            <span className="font-semibold text-on-surface">{lote}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>Vencimiento</span>
            <span className="font-semibold text-on-surface">{formattedDate}</span>
          </div>
        </div>
      </article>
    );
  }

  // Estado ABIERTO con Alerta de Vencimiento
  if (hasAlert) {
    return (
      <article
        onClick={() => onViewDetails(publication)}
        className="bg-surface-container-lowest border border-error border-opacity-50 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 relative overflow-hidden hover:shadow-md transition-all cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
        <div className="flex justify-between items-start mt-1">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{name}</h2>
          <span className="bg-secondary-container bg-opacity-20 text-secondary font-label-sm text-label-sm px-2 py-1 rounded-full border border-secondary border-opacity-20 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            ABIERTO
          </span>
        </div>
        <div className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
          <div className="flex justify-between border-b border-surface-container-high pb-2">
            <span>Lote</span>
            <span className="font-semibold text-on-surface">{lote}</span>
          </div>
          <div className="flex justify-between pt-1 items-center">
            <span>Vencimiento</span>
            <div className="flex items-center gap-1 text-error bg-error-container px-2 py-0.5 rounded text-sm">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span className="font-semibold">{formattedDate}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Estado ABIERTO Normal
  return (
    <article
      onClick={() => onViewDetails(publication)}
      className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{name}</h2>
        <span className="bg-secondary-container bg-opacity-20 text-secondary font-label-sm text-label-sm px-2 py-1 rounded-full border border-secondary border-opacity-20 flex items-center gap-1 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          ABIERTO
        </span>
      </div>
      <div className="flex flex-col gap-2 font-body-md text-body-md text-on-surface-variant">
        <div className="flex justify-between border-b border-surface-container-high pb-2">
          <span>Lote</span>
          <span className="font-semibold text-on-surface">{lote}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span>Vencimiento</span>
          <span className="font-semibold text-on-surface">{formattedDate}</span>
        </div>
      </div>
    </article>
  );
}
