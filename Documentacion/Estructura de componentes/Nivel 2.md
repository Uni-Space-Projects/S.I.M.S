```mermaid
%%Diagrama de Contenedores

classDiagram
    class Usuario {
        <<Actor>>
    }
    class Administrador {
        <<Actor>>
    }
    
    class WebApp {
        <<Container (Next.js / React)>>
        Interfaz gráfica para
        interacción de los usuarios
    }
    class APIBackend {
        <<Container (Nest.js / Node.js)>>
        Lógica de negocio, MVC
        y manejo de peticiones
    }
    class Database {
        <<Container (PostgreSQL)>>
        Almacenamiento de usuarios,
        publicaciones y transacciones
    }
    
    Usuario --> WebApp : "Accede mediante navegador [HTTPS]"
    Administrador --> WebApp : "Accede mediante navegador [HTTPS]"
    WebApp --> APIBackend : "Peticiones API [JSON/HTTPS]"
    APIBackend --> Database : "Lee y Escribe datos [TypeORM/TCP]"
    
    %% Estilos aplicados directamente
    style Usuario fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    style Administrador fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    style WebApp fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff
    style APIBackend fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff
    style Database fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff