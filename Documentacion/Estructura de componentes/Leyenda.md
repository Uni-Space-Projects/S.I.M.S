```mermaid
%%Leyenda para los diagramas de Contexto, Contenedores y Componentes

classDiagram
    class Actor {
        <<Actor>>
        Usuarios del sistema
    }
    class Sistema {
        <<System>>
        Nivel 1: Contexto
    }
    class Contenedor {
        <<Container>>
        Nivel 2: Contenedor
    }
    class Componente {
        <<Component>>
        Nivel 3: Componente
    }

    Actor --> Sistema : Comunicación Sincrónica (Línea Sólida)
    Sistema ..> Contenedor : Comunicación Asincrónica (Línea Punteada)

    %% Estilos aplicados directamente a las clases (sintaxis de classDiagram)
    style Actor fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    style Sistema fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff
    style Contenedor fill:#438dd5,stroke:#2e6295,stroke-width:2px,color:#fff
    style Componente fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#fff

