import React, { useEffect, useState } from "react";
import { PublicationBasicInfo } from "../types";

interface Props {
  publicacion: PublicationBasicInfo; // La publicación que el usuario quiere (la del otro)
  currentUserId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SolicitudTransaccionModal({
  publicacion,
  currentUserId,
  onClose,
  onSuccess,
}: Props) {
  const [misPublicaciones, setMisPublicaciones] = useState<PublicationBasicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<PublicationBasicInfo | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<PublicationBasicInfo | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cantidadAOfrecer, setCantidadAOfrecer] = useState(1);
  const [cantidadAPedir, setCantidadAPedir] = useState(1);

  // Obtener mis publicaciones para ofrecer
  useEffect(() => {
    const fetchMisPublicaciones = async () => {
      try {
        const res = await fetch(`http://localhost:3000/publications/user/${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          // Filtramos solo las que están activas y no vencidas (aunque el backend debería hacerlo)
          const validas = data.filter((p: any) => p.isActive === true && p.cantidad > 0);
          setMisPublicaciones(validas);
        }
      } catch (error) {
        console.error("Error obteniendo mis publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMisPublicaciones();
  }, [currentUserId]);

  const handleDragStart = (e: React.DragEvent, pub: PublicationBasicInfo) => {
    setDraggedItem(pub);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (draggedItem) {
      setSelectedOffer(draggedItem);
      setCantidadAOfrecer(1); // reset cantidad
    }
    setDraggedItem(null);
  };

  const handleSubmit = async () => {
    if (!selectedOffer) {
      alert("Por favor, selecciona una publicación tuya para ofrecer a cambio.");
      return;
    }
    if (cantidadAPedir <= 0 || cantidadAPedir > publicacion.quantity) {
      alert("Cantidad solicitada inválida o excede el stock disponible.");
      return;
    }
    if (cantidadAOfrecer <= 0 || cantidadAOfrecer > selectedOffer.quantity) {
      alert("Cantidad ofrecida inválida o excede tu stock disponible.");
      return;
    }

    try {
      setSubmitting(true);
      // El publicacion (el producto de la otra persona) NO TIENE "user" en su interface básica,
      // pero el Endpoint GET /publications sí trae `user.id`. Asumimos que para este punto
      // sabemos el `ownerId` o el backend deduce el dueño, pero según `api-transacciones-frontend.md`:
      // "usuarioEmisorId" es el dueño de la publicación en ese detalle.
      
      const payload = {
        detalles: [
          {
            usuarioEmisorId: currentUserId, // Yo ofrezco mi producto
            usuarioReceptorId: (publicacion as any).user?.id || (publicacion as any).usuarioId || 0, // Fallback si no viene, pero el backend lo necesita
            publicacionId: selectedOffer.id,
            cantidad: cantidadAOfrecer,
          },
          {
            usuarioEmisorId: (publicacion as any).user?.id || (publicacion as any).usuarioId || 0, // La otra persona ofrece su producto
            usuarioReceptorId: currentUserId,
            publicacionId: publicacion.id,
            cantidad: cantidadAPedir,
          }
        ]
      };

      // Si no tenemos el id del otro usuario, fallará. Dependerá de que el objeto publicacion lo tenga.
      if (!payload.detalles[1].usuarioEmisorId) {
        alert("Error crítico: No se pudo determinar el propietario de la publicación solicitada.");
        return;
      }

      const res = await fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Solicitud de trueque enviada con éxito.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const err = await res.json();
        alert(`Error al enviar solicitud: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al enviar solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        
        {/* Lado Izquierdo: Mis Publicaciones (Drag Source) */}
        <div className="flex h-1/2 flex-col border-r border-gray-100 bg-gray-50 md:h-full md:w-1/3">
          <div className="border-b border-gray-200 bg-white px-5 py-4">
            <h2 className="font-semibold text-gray-900">Mis Insumos</h2>
            <p className="text-xs text-gray-500">Arrastra lo que ofreces a cambio</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : misPublicaciones.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="text-3xl">📭</span>
                <p className="mt-2 text-sm text-gray-500">No tienes publicaciones activas para ofrecer.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {misPublicaciones.map((pub) => (
                  <div
                    key={pub.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, pub)}
                    className="cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <span className="text-xl">📦</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="truncate text-sm font-semibold text-gray-900">{pub.name}</h4>
                        <p className="text-xs text-gray-500">Stock: {pub.cantidad}</p>
                      </div>
                      <div className="text-gray-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Dropzone y Formulario */}
        <div className="flex h-1/2 flex-col md:h-full md:w-2/3">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Armar Trueque</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Lo que quiero (Fijo) */}
              <div className="flex flex-col">
                <span className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Tú solicitas
                </span>
                <div className="flex flex-1 flex-col rounded-2xl border-2 border-gray-200 bg-gray-50 p-4">
                  <div className="flex flex-col items-center flex-1">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-green-100 shadow-inner">
                         <span className="text-4xl">🎁</span>
                      </div>
                      <h3 className="mt-4 text-center text-lg font-bold text-gray-900">{publicacion.name}</h3>
                      <p className="text-sm text-gray-500">Disponible: {publicacion.cantidad}</p>
                   </div>
                   
                   <div className="mt-4 border-t border-gray-200 pt-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad a pedir:</label>
                      <input 
                         type="number" 
                         min="1" 
                         max={publicacion.cantidad} 
                         value={cantidadAPedir}
                        onChange={(e) => setCantidadAPedir(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 p-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                     />
                  </div>
                </div>
              </div>

              {/* Lo que ofrezco (Dropzone) */}
              <div className="flex flex-col">
                <span className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Tú ofreces a cambio
                </span>
                
                {!selectedOffer ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
                      isOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center p-6 text-center">
                      <svg className={`mb-3 h-10 w-10 ${isOver ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="font-medium text-gray-700">Arrastra una publicación aquí</p>
                      <p className="mt-1 text-xs text-gray-500">o selecciónala desde el panel izquierdo</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col rounded-2xl border-2 border-blue-500 bg-blue-50/30 p-4 shadow-sm relative group">
                     <button 
                       onClick={() => setSelectedOffer(null)}
                       className="absolute right-3 top-3 rounded-full bg-white p-1 text-gray-400 shadow hover:text-red-500"
                     >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>

                     <div className="flex flex-col items-center flex-1">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100 shadow-inner">
                           <span className="text-4xl">📦</span>
                        </div>
                        <h3 className="mt-4 text-center text-lg font-bold text-gray-900">{selectedOffer.name}</h3>
                        <p className="text-sm text-gray-500">Disponible: {selectedOffer.quantity}</p>
                     </div>
                     
                     <div className="mt-4 border-t border-blue-200 pt-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Cantidad a ofrecer:</label>
                        <input 
                           type="number" 
                           min="1" 
                            max={selectedOffer.cantidad} 
                            value={cantidadAOfrecer}
                            onChange={(e) => setCantidadAOfrecer(Number(e.target.value))}
                            className="w-full rounded-lg border border-blue-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                         />
                      </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
           
           <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button
                 disabled={!selectedOffer || submitting}
                onClick={handleSubmit}
                className="w-full rounded-xl bg-gray-900 py-3.5 font-bold text-white shadow transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
             >
                {submitting ? "Enviando Solicitud..." : "Enviar Solicitud de Trueque"}
             </button>
             <p className="mt-2 text-center text-xs text-gray-500">
                Al enviar la solicitud, el otro usuario deberá aceptarla para finalizar el intercambio.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
