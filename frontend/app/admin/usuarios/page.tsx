import React from "react";
import AdminUsuariosClient from "./AdminUsuariosClient";

export const metadata = {
  title: "Administración de Usuarios - SIMS",
  description: "Gestión de roles y suspensiones de usuarios de la comunidad.",
};

export default function AdminUsuariosPage() {
  return <AdminUsuariosClient />;
}
