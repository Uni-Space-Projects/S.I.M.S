"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicacionInsumo } from "../mis-publicaciones/types";
import PublicationCard from "../mis-publicaciones/components/PublicationCard";
import SearchAndFilterBar from "./components/SearchAndFilterBar";
import FilterOverlay from "./components/FilterOverlay";
import PublicationDetailModal from "../mis-publicaciones/components/PublicationDetailModal";

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
      {/* Top Navbar */}
      <nav className="bg-surface w-full sticky top-0 shadow-sm border-b border-outline-variant z-40">
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-2 cursor-pointer active:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-primary text-[24px]">
              medical_services
            </span>
            <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight text-lg">
              SIMS
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/inicio"
              className="text-primary font-bold hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm"
            >
              Inicio
            </Link>
            <Link
              href="/mis-publicaciones"
              className="text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm"
            >
              Mis Publicaciones
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("sims_user_id");
                window.location.href = "/login";
              }}
              className="text-error hover:bg-error-container hover:text-on-error-container transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm font-semibold cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

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

      {/* Bottom Nav (Mobile Devices) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden pb-safe">
        <div className="flex justify-around items-center h-20 px-4 pb-2">
          <Link
            href="/inicio"
            className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-6 py-1.5 active:scale-95 transition-transform duration-200"
          >
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold text-white">Inicio</span>
          </Link>
          <Link
            href="/mis-publicaciones"
            className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 transition-transform duration-200 hover:bg-surface-container-low rounded-xl"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold">Mis Pub.</span>
          </Link>
          <Link
            href="#"
            className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 transition-transform duration-200 hover:bg-surface-container-low rounded-xl"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold">Perfil</span>
          </Link>
        </div>
      </nav>

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
