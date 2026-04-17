# @isthislinksafe/web

isthislinksafe.com frontend. React + Vite + Tailwind. Deploys to Cloudflare Pages.

## Develop

```bash
npm install
VITE_API_BASE=http://localhost:8787 npm run dev
```

No client routing library — the 4 pages of this site navigate via standard links. If this grows past ~10 pages we can revisit.

## Deploy (Cloudflare Pages)

Build command: `npm run build` · Output dir: `dist` · Root dir: `web`
