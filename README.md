# Apex Dashboard Dinamico

Site estatico pronto para publicar no Render.

## Deploy no Render

1. Suba estes arquivos para um repositorio no GitHub, GitLab ou Bitbucket.
2. No Render, clique em **New > Static Site**.
3. Conecte o repositorio.
4. Use estes campos:
   - **Build Command:** deixe vazio
   - **Publish Directory:** `.`
5. Clique em **Create Static Site**.

O arquivo principal e `index.html`. O dashboard usa duas bibliotecas por CDN:

- `xlsx`
- `Chart.js`
