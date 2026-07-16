"use client";

import React, { useState, useEffect } from "react";
import { PublicacionInsumo } from "../mis-publicaciones/types";
import PublicationCard from "../mis-publicaciones/components/PublicationCard";
import SearchAndFilterBar from "./components/SearchAndFilterBar";
import FilterOverlay from "./components/FilterOverlay";
import PublicationDetailModal from "../mis-publicaciones/components/PublicationDetailModal";
import Navbar from "../components/Navbar";

export default function InicioClient() {
  const [publications, setPublications] = useState<PublicacionInsumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hideExpired, setHideExpired] = useState(true);

  // Estados para Modal de Detalles
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState<PublicacionInsumo | null>(null);

  useEffect(() => {
    const fetchAllPublications = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/publications`);
        if (res.ok) {
          const data = await res.json();
          setPublications(data);
        }
      } catch (error) {
        console.error("Error fetching publications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPublications();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setHideExpired(true);
    // Nota: Aquí se actualizarían los Query Params de la URL en el futuro
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    // Nota: Aquí se dispararía el push del router para los Query Params en el futuro
  };

  const handleViewDetails = (pub: PublicacionInsumo) => {
    setSelectedPub(pub);
    setIsDetailOpen(true);
  };

  // Filtrado Local (Preparado para ser reemplazado por backend params)
  const filteredPublications = publications.filter((pub) => {
    // 1. Filtrar inactivos (Criterio: El sistema debe mostrar únicamente publicaciones activas y no vencidas)
    if (!pub.isActive) return false;

    // 2. Filtrar por Búsqueda (Nombre)
    if (searchQuery && !pub.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 3. Filtrar por Categoría (tipo)
    if (selectedCategories.length > 0 && !selectedCategories.includes(pub.type)) {
      return false;
    }

    // 4. Filtrar por Vencimiento
    if (hideExpired) {
      const expirationDateObj = new Date(pub.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expirationDateObj.setHours(0, 0, 0, 0);
      if (expirationDateObj.getTime() < today.getTime()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md w-full pb-24 md:pb-0 relative">
      <Navbar activePage="inicio" />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-gutter pb-[100px] md:pb-gutter flex flex-col">
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenFilters={() => setIsFilterOpen(true)}
        />

        {/* Publications Grid */}
        {isLoading ? (
          <section className="flex flex-col items-center justify-center py-16 text-center mt-4 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
            <span className="material-symbols-outlined text-outline text-[48px] mb-4 animate-spin">
              progress_activity
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold text-lg">
              Cargando catálogo...
            </h3>
          </section>
        ) : filteredPublications.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center mt-4">
            <span className="material-symbols-outlined text-outline text-[48px] mb-4">
              search_off
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold text-lg">
              No hay resultados coincidentes
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 max-w-sm">
              Intenta buscar con otros términos o cambia los filtros seleccionados.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredPublications.map((pub) => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                onViewDetails={handleViewDetails}
              />
            ))}
          </section>
        )}
      </main>



      {/* Filter Overlay */}
      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedCategories={selectedCategories}
        onChangeCategory={handleCategoryChange}
        hideExpired={hideExpired}
        onChangeHideExpired={setHideExpired}
        onClearFilters={handleClearFilters}
        onApply={handleApplyFilters}
      />

      {/* Modal de Detalle */}
      <PublicationDetailModal
        isOpen={isDetailOpen}
        publication={selectedPub}
        onClose={() => setIsDetailOpen(false)}
        readOnly={true}
      />

      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
