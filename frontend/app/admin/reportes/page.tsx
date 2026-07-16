import React from "react";
import AdminReportesClient from "./AdminReportesClient";

export const metadata = {
  title: "Reportes de Moderación - SIMS",
  description: "Moderación de publicaciones reportadas por la comunidad.",
};

export default function AdminReportesPage() {
  return <AdminReportesClient />;
}
