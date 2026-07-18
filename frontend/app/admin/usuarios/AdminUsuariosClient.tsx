"use client";

import React, { useState, useEffect } from "react";

interface UserMock {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: "admin" | "user" | "suspend";
}

export default function AdminUsuariosClient() {
  const [users, setUsers] = useState<UserMock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados para modal de edición
  const [selectedUser, setSelectedUser] = useState<UserMock | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | "suspend">("user");
  
  // Estado para diálogo de confirmación
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ userId: number; newRole: "admin" | "user" | "suspend" } | null>(null);
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        showToast("Error al obtener los usuarios del servidor.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleEditClick = (user: UserMock) => {
    setSelectedUser(user);
    setSelectedRole(user.rol);
    setIsEditOpen(true);
  };

  const handleSaveClick = () => {
    if (!selectedUser) return;
    
    // Si no cambió el rol, solo cerrar modal
    if (selectedUser.rol === selectedRole) {
      setIsEditOpen(false);
      return;
    }

    setPendingChange({ userId: selectedUser.id, newRole: selectedRole });
    setIsEditOpen(false);
    setShowConfirm(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingChange) return;

    try {
      const storedUser = localStorage.getItem("user");
      const adminId = storedUser ? JSON.parse(storedUser).id : null;

      const res = await fetch(`http://localhost:3000/users/${pendingChange.userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rol: pendingChange.newRole, adminId }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === pendingChange.userId ? { ...u, rol: pendingChange.newRole } : u
          )
        );

        const targetUser = users.find((u) => u.id === pendingChange.userId);
        const roleText =
          pendingChange.newRole === "admin"
            ? "Administrador"
            : pendingChange.newRole === "suspend"
            ? "Suspendido"
            : "Usuario Común";

        showToast(`Rol de ${targetUser?.nombre} ${targetUser?.apellido} actualizado a ${roleText}.`);
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al actualizar el rol del usuario.");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showToast("No se pudo conectar con el servidor para actualizar el rol.");
    } finally {
      setShowConfirm(false);
      setPendingChange(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Controles de Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface"
          />
        </div>
        <div className="text-sm font-semibold text-on-surface-variant bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30 self-start md:self-auto">
          Total: {filteredUsers.length} usuarios
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4 animate-spin">
            progress_activity
          </span>
          <h3 className="font-semibold text-lg text-on-background">
            Cargando usuarios de la base de datos...
          </h3>
        </div>
      ) : (
        <>
          {/* Tabla de Usuarios (Desktop) */}
          <div className="hidden md:block overflow-hidden bg-surface border border-outline-variant rounded-2xl shadow-sm">
            <table className="w-full border-collapse text-left text-sm text-on-surface">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">Usuario</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">Correo electrónico</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">Teléfono</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">Rol</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{user.telefono}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          user.rol === "admin"
                            ? "bg-primary/10 text-primary"
                            : user.rol === "suspend"
                            ? "bg-error/10 text-error"
                            : "bg-secondary/15 text-secondary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {user.rol === "admin"
                            ? "admin_panel_settings"
                            : user.rol === "suspend"
                            ? "block"
                            : "person"}
                        </span>
                        {user.rol === "admin"
                          ? "Admin"
                          : user.rol === "suspend"
                          ? "Suspendido"
                          : "Usuario"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="inline-flex items-center gap-1 bg-surface-container-high hover:bg-primary hover:text-white transition-colors duration-200 text-on-surface px-4.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-outline-variant/20 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Editar Rol
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Lista de Usuarios (Mobile Cards) */}
          <div className="flex flex-col gap-4 md:hidden">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-5 rounded-2xl bg-surface border border-outline-variant shadow-xs flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-on-surface">
                      {user.nombre} {user.apellido}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{user.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      user.rol === "admin"
                        ? "bg-primary/10 text-primary"
                        : user.rol === "suspend"
                        ? "bg-error/10 text-error"
                        : "bg-secondary/15 text-secondary"
                    }`}
                  >
                    {user.rol === "admin" ? "Admin" : user.rol === "suspend" ? "Suspendido" : "Usuario"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-outline-variant/30 pt-3">
                  <div>
                    <p className="text-on-surface-variant font-semibold">Teléfono</p>
                    <p className="text-on-surface mt-0.5">{user.telefono}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleEditClick(user)}
                  className="w-full bg-surface-container-high hover:bg-primary hover:text-white transition-colors duration-200 py-3 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar Rol
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-2xl">
                No se encontraron usuarios.
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal: Editar Rol */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface border border-outline-variant rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-on-surface mb-2">Editar Rol de Usuario</h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Selecciona el rol para {selectedUser.nombre} {selectedUser.apellido} ({selectedUser.email}).
            </p>

            <div className="flex flex-col gap-3.5 mb-6">
              {/* Rol: User */}
              <label
                onClick={() => setSelectedRole("user")}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "user"
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={selectedRole === "user"}
                  onChange={() => setSelectedRole("user")}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Usuario Común</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Acceso normal al catálogo, publicación e intercambio de insumos.
                  </p>
                </div>
              </label>

              {/* Rol: Admin */}
              <label
                onClick={() => setSelectedRole("admin")}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "admin"
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={selectedRole === "admin"}
                  onChange={() => setSelectedRole("admin")}
                  className="accent-primary"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Administrador</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Acceso completo al Panel de Control de Administración y herramientas de moderación.
                  </p>
                </div>
              </label>

              {/* Rol: Suspend */}
              <label
                onClick={() => setSelectedRole("suspend")}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === "suspend"
                    ? "border-error bg-error/5"
                    : "border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={selectedRole === "suspend"}
                  onChange={() => setSelectedRole("suspend")}
                  className="accent-error"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-error">Suspendido</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Bloqueo temporal de la cuenta. No podrá publicar ni realizar trueques.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant font-semibold text-xs text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClick}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmación */}
      {showConfirm && pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-surface border border-outline-variant rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-tertiary text-[48px] mb-4">
              warning
            </span>
            <h3 className="text-lg font-bold text-on-surface mb-2">Confirmar Acción</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              ¿Estás seguro de que deseas modificar el rol de este usuario? Esta acción afectará de inmediato sus permisos en la plataforma.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPendingChange(null);
                }}
                className="flex-1 py-3 border border-outline-variant font-semibold text-xs rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRoleChange}
                className="flex-1 py-3 bg-primary text-on-primary font-semibold text-xs rounded-xl hover:bg-primary-container transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.25)] flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-primary-fixed-dim">check_circle</span>
          <span className="text-sm font-semibold text-white">{toastMessage}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
