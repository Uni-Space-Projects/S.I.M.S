# Documentación de API: Módulo de Transacciones (Sprint 2)

Este documento sirve como guía para el equipo de Frontend sobre cómo consumir los nuevos endpoints desarrollados para las transacciones de trueque uno a uno, correspondientes a las Historias de Usuario 4, 5, 6 y 7 del Sprint 2.

> **Importante:** La entidad `Publication` fue modificada y ahora cuenta con el campo obligatorio `cantidad`. Asegúrense de enviarlo al momento de crear o editar publicaciones (`POST /publications` o `PUT /publications/:id`).

---

## 1. Crear Transacción (Solicitar Insumos)
**Endpoint:** `POST /transactions`  
**Uso:** Inicia el ciclo de un trueque. Por defecto, su estado inicial será `pendiente`. Aquí se envía un arreglo con los detalles de las publicaciones a intercambiar. En un trueque "1 a 1", se envía la publicación solicitada y la publicación que se da a cambio.

### Body (Ejemplo)
```json
{
  "detalles": [
    {
      "usuarioEmisorId": 2,
      "usuarioReceptorId": 1,
      "publicacionId": 5,
      "cantidad": 1
    },
    {
      "usuarioEmisorId": 1,
      "usuarioReceptorId": 2,
      "publicacionId": 12,
      "cantidad": 3
    }
  ]
}
```

*Nota: `usuarioEmisorId` es el dueño de la publicación en ese detalle. El backend valida que la publicación pertenezca al emisor, que tenga stock, que no esté vencida y que el solicitante no esté pidiendo su propio producto.*

---

## 2. Obtener Todas las Transacciones
**Endpoint:** `GET /transactions`  
**Uso:** Retorna todas las transacciones junto con las relaciones de `detalles`, `usuarioEmisor`, `usuarioReceptor` y `publicacion`. Sirve para listar en los tableros (p. ej. en `TransaccionesClient.tsx`).

### Respuesta (Ejemplo abreviado)
```json
[
  {
    "id": 1,
    "fecha_transaccion": "2026-07-16T19:00:00Z",
    "estado": "pendiente",
    "calificacion": null,
    "detalles": [
      {
        "id": 1,
        "usuarioEmisor": { "id": 2, "nombre": "Juan", ... },
        "usuarioReceptor": { "id": 1, "nombre": "Pedro", ... },
        "publicacion": { "id": 5, "name": "Paracetamol", ... },
        "cantidad": 1
      }
    ]
  }
]
```

---

## 3. Obtener Transacción por ID
**Endpoint:** `GET /transactions/:id`  
**Uso:** Retorna la información detallada de una transacción en específico. Trae las mismas relaciones que el método anterior. Útil para el `TransaccionDetailModal.tsx`.

---

## 4. Actualizar Estado de Transacción
**Endpoint:** `PUT /transactions/:id/status`  
**Uso:** Sirve para avanzar en el ciclo de vida de la transacción.
Los estados permitidos son:
- `completada`
- `rechazada`
- `cancelada`

> **Nota Crítica (HU5):** Cuando se cambia el estado a `completada`, el backend se encarga automáticamente de restar la `cantidad` transada del stock (cantidad disponible) de cada publicación involucrada. Si el stock llega a 0, la publicación se marca como inactiva.

### Body
```json
{
  "estado": "completada"
}
```

---

## 5. Cancelar Transacción (Soft Delete)
**Endpoint:** `DELETE /transactions/:id`  
**Uso:** Permite al usuario solicitante cancelar la transacción (HU4). Cambiará el estado internamente a `cancelada`.
No recibe body. Retorna la transacción con el estado actualizado. No se puede cancelar si ya está en estado `completada`.

---

## 6. Calificar Transacción
**Endpoint:** `PUT /transactions/:id/rate`  
**Uso:** Permite asignar una puntuación (1 a 10) tras haber finalizado el intercambio (HU7).  
**Restricciones:** 
- La transacción debe estar obligatoriamente en estado `completada`.
- Cada transacción puede ser calificada una única vez.

### Body
```json
{
  "calificacion": 9
}
```

---

## Resumen de Integración para el Frontend

1. **Formulario de Creación (HU4):** Cuando el usuario le da "Solicitar" a una publicación y decide ofrecer la suya a cambio, armar el JSON combinando ambos dueños y productos y enviarlo por `POST /transactions`.
2. **Aprobar / Completar (HU5 / HU6):** Cuando ambos usuarios se reúnen y completan el intercambio, disparar `PUT /transactions/:id/status` con `"estado": "completada"`. El stock se rebajará automáticamente.
3. **Calificaciones (HU7):** Habilitar el botón de calificar solo en las tarjetas cuyo estado sea `completada` y que no tengan ya una calificación registrada (`calificacion === null`).
