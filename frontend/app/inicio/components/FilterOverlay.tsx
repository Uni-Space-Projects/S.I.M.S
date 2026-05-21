import React from "react";

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onChangeCategory: (category: string) => void;
  hideExpired: boolean;
  onChangeHideExpired: (val: boolean) => void;
  onClearFilters: () => void;
  onApply: () => void;
}

export default function FilterOverlay({
  isOpen,
  onClose,
  selectedCategories,
  onChangeCategory,
  hideExpired,
  onChangeHideExpired,
  onClearFilters,
  onApply,
}: FilterOverlayProps) {
  if (!isOpen) return null;

  const categories = [
    "Cardiovascular",
    "Respiratorio",
    "Muscular",
    "Neurológico",
    "Gastrointestinal",
    "Insumos Generales",
    "MEDICAMENTO"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-[12px] p-4 md:p-8">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-xl border border-outline-variant overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Filtros</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <fieldset>
            <legend className="font-label-sm text-label-sm text-primary mb-4 font-bold">Estado</legend>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                className="h-5 w-5 text-primary border-outline rounded focus:ring-primary focus:ring-offset-surface focus:ring-2 transition-colors cursor-pointer"
                checked={hideExpired}
                onChange={(e) => onChangeHideExpired(e.target.checked)}
              />
              <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                Ocultar insumos vencidos
              </span>
            </label>
          </fieldset>

          <fieldset>
            <legend className="font-label-sm text-label-sm text-primary mb-4 font-bold">Categorías Médicas</legend>
            <div className="space-y-3">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-primary border-outline rounded focus:ring-primary focus:ring-offset-surface focus:ring-2 transition-colors cursor-pointer"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => onChangeCategory(cat)}
                  />
                  <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-end space-x-4">
          <button
            onClick={onClearFilters}
            className="px-6 py-2 rounded-lg border border-primary text-primary font-body-md text-body-md font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
          >
            Limpiar
          </button>
          <button
            onClick={onApply}
            className="px-6 py-2 rounded-lg bg-primary text-on-primary font-body-md text-body-md font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
