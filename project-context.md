# Contexto del Proyecto: SIMS (Sistema de Gestión de Insumos Médicos)

## 🎯 Objetivo Principal (Variante 6)
El sistema debe garantizar la **trazabilidad, gestión de lotes y alertas de vencimiento** de insumos médicos. Toda vista o endpoint debe priorizar que no se filtren ni se utilicen medicamentos vencidos.

## 🛠 Stack Tecnológico
- **Frontend:** Next.js (React), TypeScript.
- **Backend:** NestJS, TypeScript, TypeORM.
- **Base de Datos:** PostgreSQL (o la que estés usando).

## 📐 Reglas de Arquitectura y Código
1. **Separación de Responsabilidades (DDD):** El frontend es solo la capa de presentación. Toda la lógica de negocio (validaciones de fecha de vencimiento, cálculos de stock) DEBE vivir en los servicios de NestJS en el backend.
2. **Modularidad:** El backend está dividido en módulos (`users`, `publications`, etc.). No cruzar dependencias directamente; usar servicios exportados.
3. **Tipado Estricto:** Prohibido usar `any`. Todos los DTOs y respuestas de la API deben estar tipados mediante interfaces compartidas o tipos generados.
4. **Frontend UI:** Los componentes de Next.js deben ser atómicos y reutilizables. Separar componentes de UI (presentacionales) de los componentes de página (conectados al estado/API).

## 🚀 Flujo de Trabajo Actual
Estamos desarrollando las vistas del frontend (Next.js) basadas en los Casos de Uso (HU1: Gestión de acceso, HU2: Crear publicación de insumos). Se deben conectar con los módulos ya inicializados en el backend.
