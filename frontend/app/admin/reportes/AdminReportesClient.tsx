"use client";

import React, { useState, useEffect } from "react";

interface ReportMock {
  id: number;
  publicacionNombre: string;
  autorNombre: string;
  reportadorNombre: string;
  motivo: string;
  fecha: string;
  estado: "pendiente" | "mantenido" | "ocultado";
}

interface DBReport {
  id: number;
  motivo: string;
  estado: "pendiente" | "aceptado" | "rechazado";
  fechaReporte: string;
  usuarioReporta?: {
    nombre: string;
    apellido: string;
  };
  publicacion?: {
    name: string;
    user?: {
      nombre: string;
      apellido: string;
    };
  };
}

export default function AdminReportesClient() {
  const [reports, setReports] = useState<ReportMock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "pendiente" | "resuelto">("pendiente");

  // Estado de confirmación
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    reportId: number;
    actionType: "mantener" | "ocultar";
  } | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReports = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/reports");
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((r: DBReport) => ({
          id: r.id,
          publicacionNombre: r.publicacion ? r.publicacion.name : "Insumo Médico Eliminado",
          autorNombre: r.publicacion && r.publicacion.user ? `${r.publicacion.user.nombre} ${r.publicacion.user.apellido}` : "Desconocido",
          reportadorNombre: r.usuarioReporta ? `${r.usuarioReporta.nombre} ${r.usuarioReporta.apellido}` : "Desconocido",
          motivo: r.motivo,
          fecha: r.fechaReporte ? r.fechaReporte.split("T")[0] : "",
          estado: r.estado === "pendiente" ? "pendiente" : r.estado === "aceptado" ? "ocultado" : "mantenido",
        }));
        setReports(mapped);
      } else {
        showToast("Error al obtener los reportes del servidor.");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      showToast("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const handleActionClick = (reportId: number, actionType: "mantener" | "ocultar") => {
    setPendingAction({ reportId, actionType });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    const { reportId, actionType } = pendingAction;
    const newStatus = actionType === "mantener" ? "mantenido" : "ocultado";
    const dbStatus = actionType === "mantener" ? "rechazado" : "aceptado";

    try {
      const res = await fetch(`http://localhost:3000/reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: dbStatus }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, estado: newStatus } : r))
        );

        const report = reports.find((r) => r.id === reportId);
        if (actionType === "mantener") {
          showToast(`Reporte sobre "${report?.publicacionNombre}" descartado. Publicación mantenida.`);
        } else {
          showToast(`Publicación "${report?.publicacionNombre}" ocultada con éxito.`);
        }
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al procesar la acción de moderación.");
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      showToast("No se pudo conectar con el servidor para completar la acción.");
    } finally {
      setShowConfirm(false);
      setPendingAction(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "todos") return true;
    if (filter === "pendiente") return r.estado === "pendiente";
    if (filter === "resuelto") return r.estado !== "pendiente";
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de Filtro */}
      <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30 align-self-start self-start">
        <button
          onClick={() => setFilter("pendiente")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filter === "pendiente"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setFilter("resuelto")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filter === "resuelto"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Resueltos
        </button>
        <button
          onClick={() => setFilter("todos")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            filter === "todos"
              ? "bg-primary text-on-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Todos
        </button>
      </div>

      {/* Grid de Reportes */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4 animate-spin">
            progress_activity
          </span>
          <h3 className="font-semibold text-lg text-on-background">
            Cargando reportes de moderación...
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`flex flex-col justify-between p-6 rounded-2xl bg-surface border shadow-sm transition-all duration-300 relative ${
                report.estado === "mantenido"
                  ? "border-emerald-500/30 opacity-75"
                  : report.estado === "ocultado"
                  ? "border-error/20 opacity-60 line-through decoration-transparent"
                  : "border-outline-variant hover:shadow-md hover:border-outline"
              }`}
            >
              {/* Header del Reporte */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    {report.fecha}
                  </span>

                  {/* Badge de Estado */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      report.estado === "pendiente"
                        ? "bg-tertiary-container/20 text-tertiary-container"
                        : report.estado === "mantenido"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {report.estado === "pendiente"
                      ? "Pendiente"
                      : report.estado === "mantenido"
                      ? "Mantenida"
                      : "Ocultada"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-on-background leading-snug">
                    {report.publicacionNombre}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Publicado por: <span className="font-semibold text-on-surface">{report.autorNombre}</span>
                  </p>
                </div>

                {/* Detalle del Reporte */}
                <div className="bg-surface-container-low p-4.5 rounded-xl border border-outline-variant/30 mt-2 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                    Reportado por: {report.reportadorNombre}
                  </p>
                  <p className="text-xs text-on-surface-variant italic leading-relaxed">
                    &ldquo;{report.motivo}&rdquo;
                  </p>
                </div>
              </div>

              {/* Acciones */}
              {report.estado === "pendiente" && (
                <div className="flex gap-3 mt-6 border-t border-outline-variant/30 pt-4">
                  <button
                    onClick={() => handleActionClick(report.id, "mantener")}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 bg-surface-container-high hover:bg-emerald-500 hover:text-white transition-colors py-2.5 rounded-xl text-xs font-bold cursor-pointer border border-outline-variant/30 text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Mantener
                  </button>
                  <button
                    onClick={() => handleActionClick(report.id, "ocultar")}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 bg-error/10 hover:bg-error hover:text-white transition-colors py-2.5 rounded-xl text-xs font-bold text-error cursor-pointer border border-error/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                    Ocultar
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
              <span className="material-symbols-outlined text-outline text-[48px] mb-2">
                rule_folder
              </span>
              <p className="text-sm font-semibold text-on-surface-variant">
                No hay reportes en esta categoría.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Diálogo de Confirmación */}
      {showConfirm && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-surface border border-outline-variant rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <span
              className={`material-symbols-outlined text-[48px] mb-4 ${
                pendingAction.actionType === "mantener" ? "text-emerald-500" : "text-error"
              }`}
            >
              {pendingAction.actionType === "mantener" ? "check_circle" : "warning"}
            </span>
            <h3 className="text-lg font-bold text-on-surface mb-2">Confirmar Moderación</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              {pendingAction.actionType === "mantener"
                ? "¿Estás seguro de que deseas mantener esta publicación activa y descartar el reporte?"
                : "¿Estás seguro de que deseas ocultar esta publicación? Los usuarios no podrán verla ni solicitar intercambios sobre ella."}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPendingAction(null);
                }}
                className="flex-1 py-3 border border-outline-variant font-semibold text-xs rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer text-on-surface"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-3 text-on-primary font-semibold text-xs rounded-xl transition-colors cursor-pointer ${
                  pendingAction.actionType === "mantener"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-error hover:bg-error-container"
                }`}
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
