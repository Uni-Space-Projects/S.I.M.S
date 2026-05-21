import React from "react";
import PublicationsClient from "./components/PublicationsClient";

export const metadata = {
  title: "Mis Publicaciones - SIMS",
  description: "Gestiona tu inventario de insumos médicos para intercambio comunitario.",
};

export default function MisPublicacionesPage() {
  return <PublicationsClient />;
}
