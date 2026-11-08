# PERC

The interface is branded PERC. The repository and the Vercel project stay `percolator-fork`. interface

Next.js desk for the local Percolator v16 engine. On a host with no `fork-engine` process, including this Vercel project, the page stays disconnected and read-only. It does not show a live market.

```bash
npm install
npm run dev
```

The dev server listens on `http://127.0.0.1:43123` and proxies `/api/engine` to `FORK_ENGINE_URL` (default `http://127.0.0.1:43124`).
