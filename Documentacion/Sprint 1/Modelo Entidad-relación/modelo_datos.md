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