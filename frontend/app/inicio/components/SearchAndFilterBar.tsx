import React from "react";

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
}

export default function SearchAndFilterBar({
  searchQuery,
  onSearchChange,
  onOpenFilters,
}: SearchAndFilterBarProps) {
  return (
    <section className="sticky top-16 z-40 bg-surface/95 backdrop-blur-sm px-4 md:px-0 py-3 border-b border-outline-variant shadow-sm md:bg-transparent md:border-none md:shadow-none md:static md:mb-4">
      <div className="flex gap-2 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
            search
          </span>
          <input
            type="text"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-outline-variant bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow placeholder:text-outline text-on-surface"
            placeholder="Buscar insumos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {/* Filter Button */}
        <button
          onClick={onOpenFilters}
          aria-label="Abrir filtros"
          className="h-10 px-3 flex items-center justify-center border border-outline-variant rounded-lg bg-white text-on-surface hover:bg-surface-variant active:bg-surface-variant transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl text-on-surface-variant">
            tune
          </span>
        </button>
      </div>
    </section>
  );
}
