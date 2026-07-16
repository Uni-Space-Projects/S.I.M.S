"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-background">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin mb-4">
          progress_activity
        </span>
        <p className="font-semibold text-lg">Verificando credenciales...</p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl bg-surface border border-error/20 shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-error text-[36px]">
              gpp_bad
            </span>
          </div>
          <h1 className="text-2xl font-bold text-error mb-3">Acceso Denegado</h1>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            No tienes los permisos necesarios para acceder al Panel de Administración. Esta sección es exclusiva para administradores del sistema.
          </p>
          <Link
            href="/inicio"
            className="w-full bg-primary text-on-primary font-semibold py-3 px-6 rounded-xl hover:bg-primary-container transition-all active:scale-95 text-center cursor-pointer duration-200"
          >
            Regresar a Inicio
          </Link>
        </div>
      </div>
    );
  }

  const isUsuariosActive = pathname?.includes("/admin/usuarios");
  const isReportesActive = pathname?.includes("/admin/reportes");

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md w-full pb-24 md:pb-0">
      {/* Navbar Superior Unificada */}
      <Navbar activePage="admin" />

      {/* Cabecera del Panel de Administración */}
      <header className="bg-surface w-full border-b border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-0">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px] md:text-[32px]">
                admin_panel_settings
              </span>
              Panel de Control de Administrador
            </h1>
            <p className="text-sm text-on-surface-variant">
              Gestión de usuarios y revisión de reportes de moderación de la comunidad.
            </p>
          </div>

          {/* Sub-navegación por Pestañas */}
          <div className="flex border-b border-outline-variant gap-4 overflow-x-auto scrollbar-none">
            <Link
              href="/admin/usuarios"
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all shrink-0 ${
                isUsuariosActive
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              Usuarios
            </Link>
            <Link
              href="/admin/reportes"
              className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-all shrink-0 ${
                isReportesActive
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">flag</span>
              Reportes de Moderación
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
        {children}
      </main>
    </div>
  );
}
