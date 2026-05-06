# Thiago Nonato — Portfolio

Site pessoal estático, pronto para hospedar no **GitHub Pages**.

## Estrutura

```
.
├── index.html       # Página inicial (hero + projetos em destaque)
├── about.html       # Sobre + trajetória/timeline
├── projects.html    # Lista completa de projetos
├── style.css        # Estilos (light/dark)
└── script.js        # Toggle de tema com persistência
```

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub. Para usar o domínio `https://SEU-USUARIO.github.io/`, nomeie como `SEU-USUARIO.github.io`. Caso contrário, qualquer nome serve (ficará em `https://SEU-USUARIO.github.io/nome-do-repo/`).
2. Faça upload dos arquivos (ou `git push`) para a branch `main`.
3. No GitHub: **Settings → Pages**.
4. Em *Source*, selecione **Deploy from a branch**, escolha `main` e a pasta `/ (root)`. Salve.
5. Em 1–2 minutos o site fica no ar.

## Personalizar

- **Textos** ficam direto nos arquivos `.html`.
- **Cores** dos cards estão em `style.css` no `:root` (variáveis `--violet`, `--amber`, etc.).
- **Tipografia**: serif Fraunces para títulos, sans-serif Inter para o resto. Carregadas via Google Fonts.
- **Tema**: light por padrão, com toggle para dark. Respeita o `prefers-color-scheme` do sistema.

## Próximos passos sugeridos

- Adicionar imagens reais nos `.card-visual` e `.project-cover` (substituindo o gradiente).
- Trocar a fonte se quiser algo ainda mais distinto.
- Adicionar uma página `/projects/<slug>.html` para cada projeto, com mais detalhes.
