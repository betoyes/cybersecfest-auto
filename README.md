# CybersecFEST — Galeria de Artes

Portal de artes geradas automaticamente pelo agente CybersecFEST no CREAO.

## Estrutura

```
/
├── index.html        # Galeria online
├── artes.json        # Banco de dados das artes
└── artes/
    └── [slug]/
        ├── arte.html # Peça HTML editável
        └── thumb.png # Imagem gerada por IA
```

## Deploy

Este repositório está conectado ao Vercel para deploy automático.
Cada push na branch `main` publica uma nova versão da galeria.

---

*a maior confraria estratégica de Cyber Security do Brasil*
