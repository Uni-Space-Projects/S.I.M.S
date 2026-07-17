"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReputacionSection from "./components/ReputacionSection";
import EditProfileModal from "./components/EditProfileModal";

interface UserProfile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
}

export default function PerfilClient() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserId = localStorage.getItem("sims_user_id");
      const myId = storedUserId ? parseInt(storedUserId, 10) : null;
      const targetId = queryId ? parseInt(queryId, 10) : myId;

      if (!targetId) {
        setIsLoading(false);
        return;
      }

      setIsOwnProfile(targetId === myId);

      try {
        const res = await fetch(`http://localhost:3000/users/${targetId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [queryId]);

  // Generar iniciales para el avatar
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre?.charAt(0) || ""}${apellido?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md w-full pb-24 md:pb-0">
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
              className="text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm"
            >
              Mis Publicaciones
            </Link>
            <Link
              href="/perfil"
              className="text-primary font-bold hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg font-label-sm text-label-sm text-sm"
            >
              Perfil
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

      {/* Main Content */}
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-gutter flex flex-col gap-gutter">
        {/* Page Header */}
        <header className="flex items-center gap-3 mt-2">
          <span className="material-symbols-outlined text-primary text-[28px]">
            person
          </span>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-background text-2xl md:text-3xl font-bold">
            Perfil
          </h1>
        </header>

        {isLoading ? (
          <section className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-outline text-[48px] mb-4 animate-spin">
              progress_activity
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold text-lg">
              Cargando perfil...
            </h3>
          </section>
        ) : !user ? (
          <section className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-outline text-[48px] mb-4">
              person_off
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold text-lg">
              Usuario no encontrado
            </h3>
            <p className="text-on-surface-variant text-sm mt-1">
              No se pudo encontrar la información del perfil.
            </p>
          </section>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Profile Header Card */}
            <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              {/* Banner Gradient */}
              <div className="h-28 md:h-36 bg-gradient-to-r from-primary via-primary-container to-primary/70 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]" />
              </div>

              {/* Profile Info */}
              <div className="px-6 md:px-8 pb-6 -mt-14 md:-mt-16 relative">
                {/* Avatar */}
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-surface bg-primary-container flex items-center justify-center shadow-lg mb-4">
                  <span className="text-3xl md:text-4xl font-bold text-on-primary-container">
                    {getInitials(user.nombre, user.apellido)}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-on-surface">
                      {user.nombre} {user.apellido}
                    </h2>
                    <p className="text-primary font-semibold text-sm mt-1">
                      Miembro de SIMS
                    </p>
                  </div>

                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg border border-secondary-fixed shadow-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px]">
                          verified
                        </span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs">
                          Mi Perfil
                        </span>
                      </span>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-1.5 rounded-lg shadow-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          edit
                        </span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-xs">
                          Editar
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {/* Email */}
                  <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:border-outline transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      email
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase font-semibold">
                        Email
                      </span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold text-sm truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:border-outline transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      phone
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase font-semibold">
                        Teléfono
                      </span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold text-sm truncate">
                        {user.telefono}
                      </span>
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg p-4 hover:border-outline transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      badge
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase font-semibold">
                        Rol
                      </span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold text-sm truncate capitalize">
                        {user.rol?.toLowerCase() || "Usuario"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Reputación Section */}
            <ReputacionSection userId={user.id} userName={`${user.nombre} ${user.apellido}`} />
          </div>
        )}

        {/* Modal de Edición de Perfil */}
        {isModalOpen && user && (
          <EditProfileModal
            user={user}
            onClose={() => setIsModalOpen(false)}
            onUpdateSuccess={(updatedUser) => {
              // Actualización reactiva del estado local sin recargar la página
              setUser((prevUser) => ({ ...prevUser!, ...updatedUser }));
            }}
          />
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
            className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 transition-transform duration-200 hover:bg-surface-container-low rounded-xl"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold">Mis Pub.</span>
          </Link>
          <Link
            href="/perfil"
            className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-6 py-1.5 active:scale-95 transition-transform duration-200"
          >
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-label-sm text-label-sm mt-1 text-xs font-semibold text-white">Perfil</span>
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
