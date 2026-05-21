import React from "react";
import PublicationsClient from "./components/PublicationsClient";
import { PublicacionInsumo } from "./types";

export const metadata = {
  title: "Mis Publicaciones - SIMS",
  description: "Gestiona tu inventario de insumos médicos para intercambio comunitario.",
};

async function getPublications(): Promise<PublicacionInsumo[]> {
  try {
    const res = await fetch("http://localhost:3000/publications", {
      cache: "no-store", // Para que no cachee y siempre traiga la lista fresca
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching publications:", error);
    return [];
  }
}

export default async function MisPublicacionesPage() {
  const initialPublications = await getPublications();
  
  return <PublicationsClient initialPublications={initialPublications} />;
}
