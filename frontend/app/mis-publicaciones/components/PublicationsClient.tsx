"use client";

import React, { useState, useEffect } from "react";
import { PublicacionInsumo } from "../types";
import PublicationCard from "./PublicationCard";
import CreatePublicationModal from "./CreatePublicationModal";
import PublicationDetailModal from "./PublicationDetailModal";
import Navbar from "../../components/Navbar";

export default function PublicationsClient() {
  const [publications, setPublications] = useState<PublicacionInsumo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedPublication, setLastDeletedPublication] = useState<PublicacionInsumo | null>(null);

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

  // Auto-desvanecer Toast e historial temporal
  useEffect(() => {
    if (!toastMessage) return;

    // Si hay una publicación eliminada temporalmente, dejar el toast más tiempo
    const duration = lastDeletedPublication ? 15000 : 3000;

    const timer = setTimeout(() => {
      setToastMessage(null);
      setLastDeletedPublication(null);
    }, duration);

    return () => clearTimeout(timer);
  }, [toastMessage, lastDeletedPublication]);

  // Estados para Modal de Crear/Editar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<PublicacionInsumo | null>(null);

  // Estados para Modal de Detalles
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState<PublicacionInsumo | null>(null);



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
  // const handleCloseStatus = async (id: number) => {
  //   // Por ahora solo lo actualizamos localmente, aunque idealmente haríamos un PUT aquí
  //   setPublications((prev) =>
  //     prev.map((pub) => (pub.id === id ? { ...pub, isActive: false } : pub))
  //   );
  // };

  // Eliminar una publicación
  const handleDelete = async (id: number) => {
    const pubToDelete = publications.find((pub) => pub.id === id);
    if (!pubToDelete) return;

    try {
      await fetch(`http://localhost:3000/publications/${id}`, { method: "DELETE" });
      setLastDeletedPublication(pubToDelete);
      setPublications((prev) => prev.filter((pub) => pub.id !== id));
      setToastMessage("Publicación eliminada.");
    } catch (error) {
      console.error("Error eliminando publicación", error);
      setToastMessage("Error al eliminar la publicación");
    }
  };

  // Restaurar publicación eliminada (Deshacer)
  const handleRestore = async () => {
    if (!lastDeletedPublication) return;
    const id = lastDeletedPublication.id;

    try {
      const response = await fetch(`http://localhost:3000/publications/${id}/restore`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Error al restaurar");

      const restoredPub = await response.json();

      setPublications((prev) => [restoredPub, ...prev]);
      setLastDeletedPublication(null);
      setToastMessage("Publicación restaurada con éxito.");
    } catch (error) {
      console.error("Error restaurando publicación:", error);
      setToastMessage("Error al intentar deshacer la acción");
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
    cantidad: number;
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
            cantidad: data.cantidad,
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
            cantidad: data.cantidad,
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
    } catch (error) {
      console.error("Error guardando publicación:", error);
      setToastMessage("Ocurrió un error con el servidor");
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md w-full">
      <Navbar activePage="mis-publicaciones" />

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



      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-100 bg-inverse-surface text-inverse-on-surface border border-outline-variant/10 px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.25)] flex items-center justify-between gap-4 animate-fade-in-up min-w-[320px] max-w-[95%] md:min-w-[400px]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-primary-fixed-dim">
              {lastDeletedPublication ? "delete" : "check_circle"}
            </span>
            <span className="font-label-md font-semibold text-sm tracking-wide text-white">{toastMessage}</span>
          </div>
          {lastDeletedPublication && (
            <button
              onClick={handleRestore}
              className="text-primary-fixed-dim hover:text-white transition-colors text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer active:scale-95 duration-300"
            >
              Deshacer
            </button>
          )}
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
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
