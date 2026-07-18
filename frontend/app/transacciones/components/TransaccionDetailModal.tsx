import React, { useState } from "react";
import { Transaction } from "../types";
import SolicitudTransaccionModal from "./SolicitudTransaccionModal";

interface Props {
  transaction: Transaction;
  currentUserId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TransaccionDetailModal({
  transaction,
  currentUserId,
  onClose,
  onUpdate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  const doy = transaction.detalles.find(
    (d) => d.usuarioEmisor?.id === currentUserId
  );
  const recibo = transaction.detalles.find(
    (d) => d.usuarioReceptor?.id === currentUserId
  );

  // Asumimos que si el currentUserId es el emisor del primer detalle, fue el iniciador
  const isIniciador =
    transaction.detalles[0]?.usuarioEmisor?.id === currentUserId;

  const updateStatus = async (newStatus: "completada" | "rechazada" | "cancelada") => {
    // Si se acepta (completada), mostrar advertencia de confirmación explícita (RI-01)
    if (newStatus === "completada") {
      const confirm = window.confirm(
        "¿Estás seguro de aceptar este trueque? El stock de los productos se descontará automáticamente."
      );
      if (!confirm) return;
    } else if (newStatus === "cancelada") {
      const confirm = window.confirm("¿Seguro que deseas cancelar esta solicitud?");
      if (!confirm) return;
    } else if (newStatus === "rechazada") {
      const confirm = window.confirm("¿Seguro que deseas rechazar este trueque?");
      if (!confirm) return;
    }

    try {
      setLoading(true);
      // Cancelar usa DELETE
      if (newStatus === "cancelada") {
        const res = await fetch(`http://localhost:3000/transactions/${transaction.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Transacción cancelada correctamente.");
          onUpdate();
          onClose();
        } else {
          const err = await res.json();
          alert(`Error al cancelar: ${err.message || "Error desconocido"}`);
        }
        return;
      }

      // Completada y rechazada usan PUT
      const res = await fetch(
        `http://localhost:3000/transactions/${transaction.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: newStatus, actionUserId: currentUserId }),
        }
      );

      if (res.ok) {
        alert(`Transacción ${newStatus} correctamente.`);
        onUpdate();
        onClose();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || "Error al actualizar estado"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al actualizar estado.");
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:3000/transactions/${transaction.id}/rate`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calificacion: rating }),
        }
      );
      if (res.ok) {
        alert("¡Transacción calificada con éxito!");
        onUpdate();
        onClose();
      } else {
        const err = await res.json();
        alert(`Error al calificar: ${err.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al calificar.");
    } finally {
      setLoading(false);
    }
  };

  if (showCounterOffer && recibo) {
    // Si se contraoferta, se cerrará este modal y se usará el modal de solicitud
    // pero debemos pasarle la publicación de la otra persona que queremos (recibo.publicacion)
    return (
      <SolicitudTransaccionModal
        publicacion={recibo.publicacion}
        currentUserId={currentUserId}
        onClose={() => setShowCounterOffer(false)}
        onSuccess={async () => {
          // Si se manda la nueva oferta exitosamente, rechazamos esta transacción automáticamente
          try {
            await fetch(
              `http://localhost:3000/transactions/${transaction.id}/status`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: "rechazada", actionUserId: currentUserId }),
              }
            );
          } catch (e) {
             console.error("Error al rechazar transaccion original", e);
          }
          onUpdate();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalle del Trueque
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                transaction.estado === "pendiente"
                  ? "bg-yellow-100 text-yellow-800"
                  : transaction.estado === "completada"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Estado: {transaction.estado}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(transaction.fecha_transaccion).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Lado Doy */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-gray-500">
                Tú ofreces
              </h3>
              {doy ? (
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 shadow-inner">
                    <span className="text-3xl">📦</span>
                  </div>
                  <p className="text-center font-semibold text-gray-900">
                    {doy.publicacion.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Cantidad: <span className="font-bold">{doy.cantidad}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Lote: {doy.publicacion.id} {/* Sustituir por lote real si existe en info básica */}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">N/A</p>
              )}
            </div>

            {/* Lado Recibo */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-gray-500">
                Tú recibes
              </h3>
              {recibo ? (
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 shadow-inner">
                    <span className="text-3xl">🎁</span>
                  </div>
                  <p className="text-center font-semibold text-gray-900">
                    {recibo.publicacion.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Cantidad: <span className="font-bold">{recibo.cantidad}</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Propietario: {recibo.usuarioEmisor.nombre} {recibo.usuarioEmisor.apellido}
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500">N/A</p>
              )}
            </div>
          </div>

          {/* Calificación (HU7) */}
          {transaction.estado === "completada" && transaction.calificacion === null && (
            <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
              {!showRating ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-900">¡Califica este trueque!</h4>
                    <p className="text-sm text-purple-700">Tu opinión ayuda a construir confianza.</p>
                  </div>
                  <button
                    onClick={() => setShowRating(true)}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                  >
                    Calificar
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <label className="text-sm font-medium text-purple-900">Puntuación (1 al 10):</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full max-w-xs accent-purple-600"
                  />
                  <div className="text-2xl font-bold text-purple-700">{rating}</div>
                  <div className="flex gap-2">
                    <button
                      disabled={loading}
                      onClick={submitRating}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                    >
                      {loading ? "Enviando..." : "Enviar Calificación"}
                    </button>
                    <button
                      onClick={() => setShowRating(false)}
                      className="rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {transaction.estado === "completada" && transaction.calificacion !== null && (
             <div className="mt-6 text-center">
                 <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                    ⭐ Calificación: {transaction.calificacion} / 10
                 </span>
             </div>
          )}

          {/* Acciones */}
          {transaction.estado === "pendiente" && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {isIniciador ? (
                <button
                  disabled={loading}
                  onClick={() => updateStatus("cancelada")}
                  className="w-full rounded-xl bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-100 disabled:opacity-50 sm:w-auto"
                >
                  Cancelar Solicitud
                </button>
              ) : (
                <>
                  <button
                    disabled={loading}
                    onClick={() => updateStatus("rechazada")}
                    className="w-full rounded-xl bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-200 disabled:opacity-50 sm:w-auto"
                  >
                    Rechazar
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => setShowCounterOffer(true)}
                    className="w-full rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-100 disabled:opacity-50 sm:w-auto"
                  >
                    Contraofertar
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => updateStatus("completada")}
                    className="w-full rounded-xl bg-green-600 text-white shadow-sm px-5 py-2.5 text-sm font-semibold transition hover:bg-green-700 disabled:opacity-50 sm:w-auto"
                  >
                    Aceptar Trueque
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
