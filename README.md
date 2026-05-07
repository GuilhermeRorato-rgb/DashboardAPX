# Apex Partners — Dashboard de Carteiras (Hospedagem Gratuita)

Dashboard interativo de carteiras compartilhado entre todos os usuários da empresa.

---

## Opção recomendada: Render + Supabase (100% gratuito, dados persistentes)

O **Render** hospeda o servidor Node.js gratuitamente.  
O **Supabase** armazena os dados publicados de forma persistente (grátis, 500 MB).

---

## Passo a passo

### Parte 1 — Criar o repositório no GitHub

1. Acesse [github.com](https://github.com) → **New repository**
2. Nome: `apex-dashboard` | Visibilidade: **Private** | Clique em **Create**
3. Faça upload de todos os arquivos desta pasta para o repositório  
   *(clique em "uploading an existing file" na tela inicial do repo)*

---

### Parte 2 — Configurar o Supabase (storage persistente)

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → entre com GitHub
2. Clique em **New project** → dê um nome (ex: `apex-dashboard`) → escolha a região mais próxima → **Create new project** (aguarde ~1 min)
3. No menu lateral, clique em **Storage** → **New bucket**
   - Name: `apex-dashboard`
   - Public bucket: **desativado** (privado)
   - Clique em **Create bucket**
4. Agora obtenha as credenciais:
   - Clique em **Settings** (engrenagem) → **API**
   - Copie a **Project URL** (ex: `https://xxxx.supabase.co`)
   - Copie a **service_role secret** (clique em "Reveal" — **não** use a anon key)

> ⚠️ Guarde a `service_role` com cuidado — ela tem acesso total ao projeto.

---

### Parte 3 — Deploy no Render

1. Acesse [render.com](https://render.com) → **Get Started for Free** → entre com GitHub
2. Clique em **New +** → **Web Service**
3. Selecione o repositório `apex-dashboard` → **Connect**
4. Configure:
   - **Name:** apex-dashboard *(ou qualquer nome)*
   - **Region:** escolha a mais próxima
   - **Branch:** main
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** **Free**
5. Ainda na mesma tela, expanda **Environment Variables** e adicione:

   | Key | Value |
   |-----|-------|
   | `ADMIN_PASSWORD` | sua-senha-secreta |
   | `SUPABASE_URL` | https://xxxx.supabase.co |
   | `SUPABASE_KEY` | service_role_key_aqui |

6. Clique em **Create Web Service** — o deploy leva ~2 minutos
7. Ao terminar, Render fornece uma URL: `https://apex-dashboard-xxxx.onrender.com`

---

### Parte 4 — Evitar "hibernação" do Render (gratuito)

O Render gratuito hiberna o serviço após 15 min sem acesso (primeiro acesso demora ~50s).  
Para evitar isso e garantir que o serviço fique sempre ativo:

1. Acesse [uptimerobot.com](https://uptimerobot.com) → cadastre-se gratuitamente
2. Clique em **+ Add New Monitor**
   - Monitor Type: **HTTP(s)**
   - Friendly Name: Apex Dashboard
   - URL: `https://apex-dashboard-xxxx.onrender.com/ping`
   - Monitoring Interval: **5 minutes**
3. Clique em **Create Monitor**

Pronto — o serviço nunca hiberna e os dados ficam preservados.

---

## Fluxo de uso

```
Qualquer usuário abre a URL
        ↓
Vê o dashboard com os dados mais recentes
        ↓ ↓ ↓ ↓ ↓ (todos veem o mesmo)

Admin quer atualizar:
        ↓
Clica "Trocar planilha" → importa o .xlsx
        ↓
Visualiza localmente (prévia imediata)
        ↓
Clica "🚀 Publicar" → digita a senha admin
        ↓
Dados salvos no Supabase
        ↓
Todos os usuários veem os novos dados ao recarregar
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `ADMIN_PASSWORD` | ✅ Sim | Senha para publicar dados |
| `SUPABASE_URL` | Recomendado | URL do projeto Supabase |
| `SUPABASE_KEY` | Recomendado | Chave service_role do Supabase |
| `PORT` | Não | Porta (Render define automaticamente) |

> Sem `SUPABASE_URL`/`SUPABASE_KEY`: dados ficam em arquivo local (perdidos ao reiniciar).

---

## Estrutura do projeto

```
apex-dashboard/
├── server.js          ← Backend Node.js/Express
├── package.json
├── railway.toml       ← Config opcional Railway
├── public/
│   └── index.html     ← Dashboard (frontend completo)
└── data/
    └── .gitkeep       ← Pasta para armazenamento local (fallback)
```
