"use client";

import React, { useState, useEffect } from "react";

interface ReputacionSectionProps {
  userId: number;
  userName: string;
}

export default function ReputacionSection({
  userId,
  userName,
}: ReputacionSectionProps) {
  const [trustScore, setTrustScore] = useState<number>(0);
  const [totalExchanges, setTotalExchanges] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const res = await fetch(`http://localhost:3000/transactions/reputation/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setTrustScore(data.average);
          setTotalExchanges(data.total);
        }
      } catch (error) {
        console.error("Error al obtener la reputación:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReputation();
  }, [userId]);

  const filledStars = Math.floor(trustScore);
  const hasHalfStar = trustScore - filledStars >= 0.5;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Trust Score Card */}
      <section className="bg-surface rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[22px]">
            verified_user
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
            Puntaje de Confianza de {userName}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">
              progress_activity
            </span>
          </div>
        ) : (
          <>
            {/* Score Display */}
            <div className="flex flex-col items-center justify-center flex-1 gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-bold text-on-surface">
                  {trustScore > 0 ? trustScore.toFixed(1) : "N/A"}
                </span>
                <span className="text-xl text-on-surface-variant font-medium">
                  /10.0
                </span>
              </div>

              {/* Stars (escala 10 requiere mostrar 10 iconos, pero es muy largo visualmente. Usaremos 5 íconos visuales proporcionales o 10 estrellas pequeñas) */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <span
                    key={star}
                    className="material-symbols-outlined text-[20px]"
                    style={{
                      fontVariationSettings:
                        star <= filledStars
                          ? "'FILL' 1"
                          : star === filledStars + 1 && hasHalfStar
                          ? "'FILL' 0"
                          : "'FILL' 0",
                      color:
                        star <= filledStars
                          ? "#F59E0B"
                          : star === filledStars + 1 && hasHalfStar
                          ? "#F59E0B"
                          : "#C2C6D8",
                    }}
                  >
                    {star <= filledStars
                      ? "star"
                      : star === filledStars + 1 && hasHalfStar
                      ? "star_half"
                      : "star"}
                  </span>
                ))}
              </div>

              <p className="text-on-surface-variant text-sm text-center mt-1">
                {totalExchanges > 0 
                  ? `Basado en ${totalExchanges} trueques calificados.` 
                  : "Aún no ha recibido calificaciones."}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-2 mt-6 max-w-sm mx-auto w-full">
              {totalExchanges >= 5 && trustScore >= 8 && (
                <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 hover:border-outline transition-colors">
                  <span
                    className="material-symbols-outlined text-primary text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold text-sm">
                    Proveedor Destacado
                  </span>
                </div>
              )}
              {totalExchanges >= 1 && (
                <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 hover:border-outline transition-colors">
                  <span
                    className="material-symbols-outlined text-primary text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold text-sm">
                    Intercambiador Verificado
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
