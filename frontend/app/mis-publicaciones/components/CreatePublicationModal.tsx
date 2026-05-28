"use client";
import React, { useState, useEffect } from "react";
import { PublicacionInsumo } from "../types";

interface CreatePublicationModalProps {
  publication?: PublicacionInsumo | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    lote: string;
    expirationDate: string;
    description: string;
  }) => void;
}

export default function CreatePublicationModal({
  publication,
  isOpen,
  onClose,
  onSubmit,
}: CreatePublicationModalProps) {
  const [name, setName] = useState("");
  const [lote, setLote] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [description, setDescription] = useState("");

  const isEditing = !!publication;

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (publication) {
      setName(publication.name);
      setLote(publication.lote);
      setExpirationDate(publication.expirationDate);
      setDescription(publication.description || "");
    } else {
      // Limpiar formulario para nueva creación
      setName("");
      setLote("");
      setExpirationDate("");
      setDescription("");
    }
  }, [publication, isOpen]);

  if (!isOpen) return null;

  // Obtener fecha de hoy en formato YYYY-MM-DD para el atributo 'min' del input de fecha
  const getTodayString = () => {
    try {
      return new Date().toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Validaciones del formulario
  const isFormValid =
    name.trim() !== "" &&
    lote.trim() !== "" &&
    expirationDate !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onSubmit({
      name: name.trim(),
      lote: lote.trim(),
      expirationDate,
      description: description.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-0 bg-on-background/30 backdrop-blur-md transition-opacity duration-300"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      {/* Modal Surface */}
      <div className="bg-surface-container-lowest w-full max-w-md rounded-t-xl md:rounded-xl shadow-[0_16px_32px_-4px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] md:max-h-[795px] overflow-hidden transform transition-all duration-300 relative border border-outline-variant">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between sticky top-0 bg-surface-container-lowest z-10">
          <h2
            className="font-headline-md text-headline-md text-on-surface font-bold text-xl"
            id="modal-title"
          >
            {isEditing ? "Editar Publicación" : "Crear Publicación"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2 transition-colors flex items-center justify-center cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined" data-icon="close">
              close
            </span>
          </button>
        </div>

        {/* Body / Form */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            id="create-post-form"
          >
            {/* Insumo Name */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant font-semibold text-xs"
                htmlFor="insumo-name"
              >
                Nombre del insumo
              </label>
              <input
                id="insumo-name"
                name="insumo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Solución Salina 500ml"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline"
                type="text"
              />
            </div>

            {/* Lote */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant font-semibold text-xs"
                htmlFor="insumo-lote"
              >
                Lote
              </label>
              <input
                id="insumo-lote"
                name="insumo-lote"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                placeholder="Ej. L-89234"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline"
                type="text"
              />
            </div>

            {/* Vencimiento */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant font-semibold text-xs"
                htmlFor="insumo-date"
              >
                Fecha de vencimiento
              </label>
              <div className="relative">
                <input
                  id="insumo-date"
                  name="insumo-date"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={getTodayString()}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant font-semibold text-xs"
                htmlFor="insumo-desc"
              >
                Descripción (Opcional)
              </label>
              <textarea
                id="insumo-desc"
                name="insumo-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles adicionales sobre el estado, empaque, etc."
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none placeholder:text-outline"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer / Actions */}
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-label-sm text-label-sm text-primary hover:bg-surface-container-low transition-colors border border-transparent cursor-pointer font-semibold"
            type="button"
          >
            Cancelar
          </button>
          <button
            form="create-post-form"
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-lg font-label-sm text-label-sm font-semibold text-on-primary bg-primary hover:bg-[#0052CC] transition-colors flex items-center gap-2 ${isFormValid
              ? "cursor-pointer"
              : "opacity-40 cursor-not-allowed"
              }`}
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="save">
              save
            </span>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
