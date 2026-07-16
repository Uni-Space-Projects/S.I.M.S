"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  activePage: "inicio" | "mis-publicaciones" | "admin" | "perfil";
}

export default function Navbar({ activePage }: NavbarProps) {
  const { role, logout } = useAuth();

  return (
    <>
      {/* Top Navbar (Desktop) */}
      <nav className="bg-surface w-full sticky top-0 shadow-sm border-b border-outline-variant z-40">
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full max-w-container-max mx-auto">
          <Link href="/inicio" className="flex items-center gap-2 cursor-pointer active:opacity-80 transition-opacity decoration-none">
            <span className="material-symbols-outlined text-primary text-[24px]">
              medical_services
            </span>
            <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight text-lg">
              SIMS
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/inicio"
              className={`transition-colors px-3 py-2 rounded-lg font-label-sm text-sm font-semibold hover:bg-surface-container-low ${
                activePage === "inicio" ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              Inicio
            </Link>
            
            <Link
              href="/mis-publicaciones"
              className={`transition-colors px-3 py-2 rounded-lg font-label-sm text-sm font-semibold hover:bg-surface-container-low ${
                activePage === "mis-publicaciones" ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              Mis Publicaciones
            </Link>

            {/* Solo visible si el rol es admin */}
            {role === "admin" && (
              <Link
                href="/admin/usuarios"
                className={`transition-colors px-3 py-2 rounded-lg font-label-sm text-sm font-semibold hover:bg-surface-container-low ${
                  activePage === "admin" ? "text-primary font-bold" : "text-on-surface-variant"
                }`}
              >
                Admin Panel
              </Link>
            )}

            <Link
              href="#"
              className={`transition-colors px-3 py-2 rounded-lg font-label-sm text-sm font-semibold hover:bg-surface-container-low ${
                activePage === "perfil" ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              Perfil
            </Link>
            
            <button
              onClick={logout}
              className="text-error hover:bg-error-container hover:text-on-error-container transition-colors px-3 py-2 rounded-lg font-label-sm text-sm font-semibold cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Bottom Nav (Mobile Devices) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden pb-safe">
        <div className="flex justify-around items-center h-20 px-2 pb-2">
          <Link
            href="/inicio"
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              activePage === "inicio"
                ? "bg-primary-container text-on-primary-container rounded-xl px-5 py-1.5 font-semibold text-white"
                : "text-on-surface-variant px-3 py-1 hover:bg-surface-container-low rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === "inicio" ? "'FILL' 1" : undefined }}>
              home
            </span>
            <span className="font-label-sm mt-1 text-[11px] font-semibold">Inicio</span>
          </Link>

          <Link
            href="/mis-publicaciones"
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              activePage === "mis-publicaciones"
                ? "bg-primary-container text-on-primary-container rounded-xl px-5 py-1.5 font-semibold text-white"
                : "text-on-surface-variant px-3 py-1 hover:bg-surface-container-low rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === "mis-publicaciones" ? "'FILL' 1" : undefined }}>
              inventory_2
            </span>
            <span className="font-label-sm mt-1 text-[11px] font-semibold">Mis Pub.</span>
          </Link>

          {/* Solo visible si el rol es admin */}
          {role === "admin" && (
            <Link
              href="/admin/usuarios"
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                activePage === "admin"
                  ? "bg-primary-container text-on-primary-container rounded-xl px-5 py-1.5 font-semibold text-white"
                  : "text-on-surface-variant px-3 py-1 hover:bg-surface-container-low rounded-xl"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === "admin" ? "'FILL' 1" : undefined }}>
                admin_panel_settings
              </span>
              <span className="font-label-sm mt-1 text-[11px] font-semibold">Admin</span>
            </Link>
          )}

          <Link
            href="#"
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              activePage === "perfil"
                ? "bg-primary-container text-on-primary-container rounded-xl px-5 py-1.5 font-semibold text-white"
                : "text-on-surface-variant px-3 py-1 hover:bg-surface-container-low rounded-xl"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activePage === "perfil" ? "'FILL' 1" : undefined }}>
              person
            </span>
            <span className="font-label-sm mt-1 text-[11px] font-semibold">Perfil</span>
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
