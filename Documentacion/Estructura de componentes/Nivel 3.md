```mermaid
%%Diagrama de Componentes

classDiagram
    class WebApp {
        <<Container Next.js>>
    }
    class Database {
        <<Container PostgreSQL>>
    }

    class ModuloUsuarios {
        <<Component Controller Service>>
        +String perfil
        +registro()
        +autenticacion()
    }
    class ModuloPublicaciones {
        <<Component Controller Service>>
        +crearPublicacion()
        +actualizarPublicacion()
        +eliminarPublicacion()
    }
    class ModuloTransacciones {
        <<Component Controller Service>>
        +gestionarTrueques()
        +validarEstados()
    }
    class ModuloAdministracion {
        <<Component Controller Service>>
        +gestionarReportes()
        +gestionarAlertas()
        +moderacion()
    }
    class GestorDeEventos {
        <<Component Event Emitter>>
        +emitirEvento()
        +cerrarTransaccion()
    }

    WebApp --> ModuloUsuarios : Rutas usuarios REST
    WebApp --> ModuloPublicaciones : Rutas publicaciones REST
    WebApp --> ModuloTransacciones : Rutas transacciones REST
    WebApp --> ModuloAdministracion : Rutas admin REST
    
    ModuloTransacciones ..> GestorDeEventos : Emite evento Asincrono
    
    ModuloUsuarios --> Database : Lectura Escritura TypeORM
    ModuloPublicaciones --> Database : Lectura Escritura TypeORM
    ModuloTransacciones --> Database : Lectura Escritura TypeORM
    ModuloAdministracion --> Database : Lectura Escritura TypeORM

    %% Estilos aplicados directamente
    style WebApp fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff
    style Database fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff
    style ModuloUsuarios fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style ModuloPublicaciones fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style ModuloTransacciones fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style ModuloAdministracion fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff
    style GestorDeEventos fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff