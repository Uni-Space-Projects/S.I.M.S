"use client";

import React, { useState } from "react";
import { PublicacionInsumo } from "../types";

interface PublicationDetailModalProps {
  publication: PublicacionInsumo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (pub: PublicacionInsumo) => void;
  onDelete: (id: number) => void;
}

export default function PublicationDetailModal({
  publication,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: PublicationDetailModalProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Resetear el estado de confirmación si se cierra o cambia la publicación
  React.useEffect(() => {
    setIsConfirmingDelete(false);
  }, [isOpen, publication]);

  if (!isOpen || !publication) return null;

  const { name, lote, expirationDate, description, isActive } = publication;

  return (
    <div
      className="fixed inset-0 z-40 bg-on-background/10 backdrop-blur-[12px] transition-opacity duration-300 flex items-center justify-center p-margin-mobile md:p-margin-desktop"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-[600px] bg-surface rounded-xl shadow-[0_16px_32px_-4px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-[fade-in-up_0.3s_ease-out] border border-outline-variant">
        {/* Header Section */}
        <div className="flex items-center justify-between px-gutter py-4 border-b border-outline-variant/50 bg-surface">
          <div className="flex items-center gap-3 text-on-surface">
            <span aria-hidden="true" className="material-symbols-outlined text-primary">
              medical_information
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-lg" id="modal-title">
              Detalle de Publicación
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full p-2 transition-colors flex items-center justify-center cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Body (Bento-style layout) */}
        <div className="p-gutter flex flex-col gap-6">
          {/* Main Identity & Status */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2 text-2xl font-bold">
                {name}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                Insumo médico registrado
              </p>
            </div>
            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg border border-secondary-fixed shadow-sm font-semibold">
              <span className="material-symbols-outlined text-[16px]">
                {isActive ? "check_circle" : "cancel"}
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs">
                {isActive ? "ABIERTO" : "CERRADO"}
              </span>
            </div>
          </div>

          {/* Meta Data Grid (Bento-style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lote */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col gap-1 shadow-sm hover:border-outline transition-colors">
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase text-xs font-semibold">
                  Lote
                </span>
              </div>
              <span className="font-body-lg text-body-lg text-on-surface font-semibold">
                {lote}
              </span>
            </div>

            {/* Vencimiento */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col gap-1 shadow-sm hover:border-outline transition-colors">
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase text-xs font-semibold">
                  Vencimiento
                </span>
              </div>
              <span className="font-body-lg text-body-lg text-on-surface font-semibold">
                {expirationDate}
              </span>
            </div>
          </div>

          {/* Description Area */}
          <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/40 relative overflow-hidden">
            {/* Subtle visual accent for description box */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-l-xl"></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">description</span>
              <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide text-xs font-bold">
                Descripción Detallada
              </h4>
            </div>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed pl-1">
              {description || "No se ha proporcionado una descripción detallada para este insumo."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-gutter py-4 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-end gap-3 rounded-b-xl">
          {isConfirmingDelete ? (
            <>
              <span className="text-error font-body-sm font-semibold mr-auto">¿Estás seguro?</span>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-sm text-label-sm font-semibold hover:bg-surface-container-low transition-colors w-full sm:w-auto text-center cursor-pointer"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(publication.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-lg border border-error bg-error text-on-error font-label-sm text-label-sm font-semibold hover:bg-[#B3261E] transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">warning</span>
                Sí, Eliminar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-sm text-label-sm font-semibold hover:bg-surface-container-low transition-colors w-full sm:w-auto text-center"
                type="button"
              >
                Volver
              </button>
              {isActive && (
                <>
                  <button
                    onClick={() => {
                      onEdit(publication);
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-lg border border-primary text-primary bg-surface font-label-sm text-label-sm font-semibold hover:bg-primary/5 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Editar
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-5 py-2.5 rounded-lg border border-error bg-surface text-error font-label-sm text-label-sm font-semibold hover:bg-error-container hover:text-on-error-container transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Eliminar
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
