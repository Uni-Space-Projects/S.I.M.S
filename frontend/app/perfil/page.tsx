"use client";

import { Suspense } from "react";
import PerfilClient from "./PerfilClient";

export default function PerfilPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <span className="material-symbols-outlined text-outline text-[48px] animate-spin">
            progress_activity
          </span>
        </div>
      }
    >
      <PerfilClient />
    </Suspense>
  );
}
