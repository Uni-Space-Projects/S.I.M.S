```mermaid
%%Diagrama de Contexto

classDiagram
    class Usuario {
        <<Actor>>
        Publica insumos, realiza
        trueques y gestiona perfil.
    }
    class Administrador {
        <<Actor>>
        Gestiona usuarios, reportes
        y monitorea alertas.
    }
    class SIMS {
        <<System>>
        Sistema de Intercambio
        de Medicinas Social (SIMS)
    }
    
    Usuario --> SIMS : "Interactúa con [Sincrónico]"
    Administrador --> SIMS : "Modera plataforma [Sincrónico]"
    
    %% Estilos aplicados directamente
    style Usuario fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    style Administrador fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff
    style SIMS fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#fff