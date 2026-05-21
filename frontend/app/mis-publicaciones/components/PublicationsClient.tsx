"use client";

import React, { useState, useEffect } from "react";
import { PublicacionInsumo } from "../types";
import PublicationCard from "./PublicationCard";
import CreatePublicationModal from "./CreatePublicationModal";
import PublicationDetailModal from "./PublicationDetailModal";
import Link from "next/link";

export default function PublicationsClient() {
  const [publications, setPublications] = useState<PublicacionInsumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPublications = async () => {
      const storedUserId = localStorage.getItem("sims_user_id");
      const userId = storedUserId ? parseInt(storedUserId, 10) : 1;

      try {
        const res = await fetch(`http://localhost:3000/publications/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setPublications(data);
        }
      } catch (error) {
        console.error("Error fetching user publications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPublications();
  }, []);

  // Estados para Modal de Crear/Editar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<PublicacionInsumo | null>(null);

  // Estados para Modal de Detalles
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState<PublicacionInsumo | null>(null);

  // Estados para Notificaciones
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Abrir Modal para crear una nueva publicación
  const handleOpenCreate = () => {
    setEditingPub(null);
    setIsCreateOpen(true);
  };

  // Abrir Modal para editar una publicación existente
  const handleEdit = (pub: PublicacionInsumo) => {
    setEditingPub(pub);
    setIsCreateOpen(true);
  };

  // Cerrar/Terminar el estado de una publicación (cambiar estado a CERRADO)
  const handleCloseStatus = async (id: number) => {
    // Por ahora solo lo actualizamos localmente, aunque idealmente haríamos un PUT aquí
    setPublications((prev) =>
      prev.map((pub) => (pub.id === id ? { ...pub, isActive: false } : pub))
    );
  };

  // Eliminar una publicación
  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/publications/${id}`, { method: "DELETE" });
      setPublications((prev) => prev.filter((pub) => pub.id !== id));
    } catch (error) {
      console.error("Error eliminando publicación", error);
    }
  };

  // Abrir Modal para ver los detalles de una publicación
  const handleViewDetails = (pub: PublicacionInsumo) => {
    setSelectedPub(pub);
    setIsDetailOpen(true);
  };

  // Guardar publicación (Crear o Actualizar)
  const handleSavePublication = async (data: {
    name: string;
    lote: string;
    expirationDate: string;
    description: string;
  }) => {
    const storedUserId = localStorage.getItem("sims_user_id");
    const userId = storedUserId ? parseInt(storedUserId, 10) : 1; // Fallback a 1

    try {
      if (editingPub) {
        // Modo Edición: Actualizar la publicación existente en el backend
        const response = await fetch(`http://localhost:3000/publications/${editingPub.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            lote: data.lote,
            expirationDate: data.expirationDate,
            description: data.description,
          }),
        });

        if (!response.ok) throw new Error("Error al actualizar");

        // Obtener el objeto actualizado desde el servidor
        const updatedPubFromServer = await response.json();

        setPublications((prev) =>
          prev.map((pub) => (pub.id === editingPub.id ? updatedPubFromServer : pub))
        );

        setToastMessage("Publicación actualizada con éxito");
        setSelectedPub(updatedPubFromServer);
        setIsDetailOpen(true);
      } else {
        // Modo Creación: Añadir nueva publicación en el backend
        const response = await fetch("http://localhost:3000/publications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            lote: data.lote,
            expirationDate: data.expirationDate,
            description: data.description,
            type: "MEDICAMENTO", // Valor por defecto
            userId: userId,
          }),
        });

        if (!response.ok) throw new Error("Error al crear");

        // Obtener la entidad real con el ID de la base de datos
        const newPubFromServer = await response.json();

        setPublications((prev) => [newPubFromServer, ...prev]);
        setToastMessage("Publicación creada con éxito");

        // Enseñar el Preview (Modal Detalles) tras crear
        setSelectedPub(newPubFromServer);
        setIsDetailOpen(true);
      }

      setIsCreateOpen(false);
      setEditingPub(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error guardando publicación:", error);
      setToastMessage("Ocurrió un error con el servidor");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md w-full">
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
              className="text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm"
            >
              Inicio
            </Link>
            <Link
              href="/mis-publicaciones"
              className="text-primary font-bold hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm"
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
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-gutter pb-[100px] md:pb-gutter flex flex-col gap-gutter">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background text-2xl md:text-3xl font-bold">
              Mis Publicaciones
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">
              Gestiona tu inventario de insumos médicos para intercambio.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="bg-primary text-on-primary font-label-sm text-label-sm font-semibold rounded-lg px-6 py-3 flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Crear Publicación
          </button>
        </header>

        {/* Publications Grid */}
        {isLoading ? (
          <section className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-outline text-[48px] mb-4 animate-spin">
              progress_activity
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold text-lg">
              Cargando tus publicaciones...
            </h3>
          </section>
        ) : publications.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-outline text-[48px] mb-4">
              inventory_2
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold text-lg">
              No tienes publicaciones creadas
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 mb-6 max-w-sm">
              Registra los insumos médicos que te gustaría ofrecer para intercambio en la comunidad.
            </p>
            <button
              onClick={handleOpenCreate}
              className="bg-primary text-on-primary font-label-sm text-label-sm font-semibold rounded-lg px-6 py-2.5 flex items-center justify-center gap-2 hover:bg-primary-container transition-colors cursor-pointer"
            >
              Crear tu primera publicación
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {publications.map((pub) => (
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
            className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 transition-transform duration-200 hover:bg-surface-container-low rounded-xl"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold">Inicio</span>
          </Link>
          <Link
            href="/mis-publicaciones"
            className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-6 py-1.5 active:scale-95 transition-transform duration-200"
          >
            <span className="material-symbols-outlined text-white">inventory_2</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold text-white">Mis Publicaciones</span>
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 animate-fade-in-down">
          <span className="material-symbols-outlined text-[22px] text-primary">check_circle</span>
          <span className="font-label-md font-bold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Modal de Crear / Editar */}
      <CreatePublicationModal
        isOpen={isCreateOpen}
        publication={editingPub}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleSavePublication}
      />

      {/* Modal de Detalle */}
      <PublicationDetailModal
        isOpen={isDetailOpen}
        publication={selectedPub}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
