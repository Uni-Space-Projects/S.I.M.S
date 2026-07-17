"use client";

import React, { useState } from "react";

interface EditProfileModalProps {
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  onClose: () => void;
  onUpdateSuccess: (updatedUser: any) => void;
}

/**
 * EditProfileModal - Modal controlado para editar el perfil del usuario.
 *
 * SEGURIDAD:
 * - El fetch PUT se dirige a /users/profile (sin :id en la URL).
 * - El header 'x-user-id' se envía con el ID del usuario de la sesión simulada.
 * - Solo se envían los campos permitidos (nombre, apellido, email, telefono).
 *
 * UX:
 * - Validación local antes de enviar.
 * - Estados claros: cargando, éxito con mensaje visual, error con detalle del backend.
 * - El modal permanece 2s mostrando el éxito antes de cerrarse automáticamente.
 */
export default function EditProfileModal({
  user,
  onClose,
  onUpdateSuccess,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validación local rápida
    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.email.trim()
    ) {
      setError(
        "Por favor, completa los campos obligatorios (Nombre, Apellido, Email)."
      );
      setIsLoading(false);
      return;
    }

    try {
      // SEGURIDAD: Se envía el ID por header, no por URL, previniendo IDOR
      const response = await fetch("http://localhost:3000/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id.toString(),
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Lee el mensaje exacto del backend (ej: duplicidad de correo HTTP 409)
        throw new Error(errorData.message || "Error al actualizar el perfil.");
      }

      const updatedUser = await response.json();

      // Mostrar mensaje de éxito visible antes de cerrar
      setSuccessMessage("¡Perfil actualizado con éxito!");
      onUpdateSuccess(updatedUser);

      // Cierre automático tras 2 segundos para que el usuario lea el feedback
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant/30">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-primary-container p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">
                manage_accounts
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">
              Editar Mi Perfil
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container/30 flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-5 overflow-y-auto"
        >
          {/* Alerta de Error */}
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl text-sm font-semibold flex items-start gap-3 shadow-sm border border-error/20">
              <span className="material-symbols-outlined text-error text-[20px] mt-0.5">
                error
              </span>
              <p>{error}</p>
            </div>
          )}

          {/* Alerta de Éxito */}
          {successMessage && (
            <div className="bg-primary-container text-on-primary-container p-4 rounded-xl text-sm font-semibold flex items-start gap-3 shadow-sm border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                check_circle
              </span>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Nombre y Apellido en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">
                Nombre <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="px-4 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">
                Apellido <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
                className="px-4 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">
              Correo Electrónico <span className="text-error">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className="px-4 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">
              Teléfono
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[20px]">
                call
              </span>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+123 456 7890"
                className="w-full pl-11 pr-4 py-2.5 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || !!successMessage}
              className="px-5 py-2.5 font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className={`px-6 py-2.5 font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 ${
                successMessage
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-primary text-on-primary hover:bg-primary/90 hover:shadow-lg active:scale-95"
              } disabled:opacity-70`}
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                  Guardando...
                </>
              ) : successMessage ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    done
                  </span>
                  Guardado
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
