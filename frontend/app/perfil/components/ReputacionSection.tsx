"use client";

import React from "react";

interface ReputacionSectionProps {
  userId: number;
  userName: string;
}

// Datos de feedback simulados (estos datos serán reemplazados con datos reales en un sprint futuro)
const mockFeedback = [
  {
    id: 1,
    institution: "Centro Médico Mercy",
    date: "12 Oct, 2023",
    comment:
      "Intercambio confiable de solución fisiológica. La documentación fue perfecta y los tiempos de entrega se respetaron.",
    icon: "local_hospital",
  },
  {
    id: 2,
    institution: "Clínica San Judas",
    date: "28 Sep, 2023",
    comment:
      "Respuesta rápida a nuestra solicitud urgente de mascarillas quirúrgicas. Altamente recomendado para transacciones.",
    icon: "health_and_safety",
  },
  {
    id: 3,
    institution: "Dept. Salud Regional",
    date: "15 Sep, 2023",
    comment:
      "Transferencia fluida de ventiladores excedentes. El equipo maneja la logística de manera muy profesional.",
    icon: "account_balance",
  },
];

export default function ReputacionSection({
  userId,
  userName,
}: ReputacionSectionProps) {
  // Puntaje simulado basado en el ID del usuario (será reemplazado con datos reales)
  const trustScore = Math.min(5, Math.max(3.5, 4.8 - (userId % 3) * 0.3));
  const totalExchanges = 100 + (userId * 42) % 200;
  const filledStars = Math.floor(trustScore);
  const hasHalfStar = trustScore - filledStars >= 0.3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Trust Score Card */}
      <section className="bg-surface rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[22px]">
            verified_user
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
            Puntaje de Confianza
          </h3>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl md:text-6xl font-bold text-on-surface">
              {trustScore.toFixed(1)}
            </span>
            <span className="text-xl text-on-surface-variant font-medium">
              /5.0
            </span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="material-symbols-outlined text-[24px]"
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
            Basado en {totalExchanges} intercambios completados.
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-2 mt-6">
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
        </div>
      </section>

      {/* Recent Feedback Card */}
      <section className="bg-surface rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[22px]">
            rate_review
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold text-lg">
            Feedback Reciente
          </h3>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {mockFeedback.map((fb) => (
            <div
              key={fb.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:border-outline transition-colors hover:shadow-sm"
            >
              {/* Feedback Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-[18px]">
                    {fb.icon}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold text-sm truncate">
                    {fb.institution}
                  </span>
                  <span className="text-on-surface-variant text-xs">
                    {fb.date}
                  </span>
                </div>
              </div>

              {/* Feedback Comment */}
              <p className="text-on-surface-variant text-sm leading-relaxed pl-12">
                &ldquo;{fb.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
