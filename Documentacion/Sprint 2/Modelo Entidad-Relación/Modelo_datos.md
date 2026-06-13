```mermaid
erDiagram
    
    UserEntity ||--o{ Publication : "crea >"

    UserEntity {
        int id PK
        string nombre
        string apellido
        string email
        string contrasena
        string telefono
        string rol "enum: admin, user, suspend"
    }
    
    UserEntity ||--o{ Transacciones : "realiza >"

    Publication {
        int id PK
        int usuario_id FK "Clave foránea de USER"
        string nombre
        string lote
        date fecha_expiracion
        string descripcion
        string tipo
        boolean activa "Indica si está activa"
    }
    
    Publication ||--o{ Detalle_Transaccion : "adquiere >"

    Transacciones {
        int id PK
        date fecha_transaccion
        string estado "enum: pendiente, completada, cancelada, rechazada"
    }
    
    Transacciones ||--o{ Detalle_Transaccion : "tiene >"

    Detalle_Transaccion {
        int id PK
        int transaccion_id FK "Clave foránea de TRANSACCIONES"
        int usuario_emisor_id FK "Clave foránea de USER (emisor)"
        int usuario_receptor_id FK "Clave foránea de USER (receptor)"
        int publicacion_id FK "Clave foránea de PUBLICATION"
        int cantidad
    }