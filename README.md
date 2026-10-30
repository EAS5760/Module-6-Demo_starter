# Module 6 — coding demo starter

One standalone Bootstrap example and one React Task Dashboard that continues
through demos 2–6. This is starter code: layout TODOs remain for the recording.
Task interactions and API helpers are already wired so deployment demos can
focus on hosting and configuration. No sites have been deployed for you.

## Folders

| Folder/file | Purpose |
| --- | --- |
| bootstrap-demo/index.html | Demo 1: add responsive Bootstrap columns |
| frontend/ | Demos 2–4 and 6: Vite + React 19 + MUI 7 |
| backend/ | Demo 5: completed Module 4 Express + Mongoose API |
| demo-guide.md | Exact TODOs and expected viewport results |
| deployment-guide.md | Vercel, Render, Atlas, and end-to-end checklist |

## Start Demo 1

Open bootstrap-demo/index.html in Chrome. Internet is required to load the
Bootstrap 5.3.8 CDN stylesheet. Both sections initially stack at all widths.
Add col-md-6 to both sections during the demo.

## Start Demos 2–3 (no API or Atlas needed)

Requirements: Node.js 22.12+ (Node 24 is also suitable) and npm.

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. The default VITE_DATA_SOURCE=sample uses sample tasks
in React state. Add, mark complete, and delete work immediately. Refreshing the
page resets sample data. Layouts initially use one column at every viewport width.

Edit src/components/TaskGrid.jsx for Demo 2 and src/styles.css for Demo 3.
Completed snippets are in demo-guide.md so you can apply them while recording.

## Start with the real API (Demos 5–6)

1. In backend, run npm ci.
2. Edit backend/.env: use your Atlas connection URI, replace JWT_SECRET with a
   random value, and keep FRONTEND_URL=http://localhost:5173.
3. Add your current public IP in Atlas network access, and create a database user
   with read/write access to task_api_demo. URL-encode special characters in URI
   credentials. Atlas login credentials are different from database credentials.
4. In backend run npm run dev. Check http://localhost:3000/health.
5. Set these frontend/.env values:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3000
```

6. Restart the frontend, register an account or sign in, then add/complete/delete.

Generate a JWT secret in a terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Both folders include .env files with placeholders or public local settings only.
If absent, copy .env.example to .env. Never paste Atlas credentials or JWT_SECRET
into the frontend. VITE_ values are bundled into public browser code.

## Authentication scope

The backend matches Module 4: only GET /tasks is protected; other CRUD routes
remain public. All demo accounts share tasks; there is no ownership filtering.
The frontend holds tokens in memory and returns to sign-in after refresh or 401.
This pack keeps the existing teaching scope; it does not implement the remaining
authentication student activity. Use an isolated demo database and demo data.

## Ports

- React dev: 5173 (backend FRONTEND_URL must match exactly).
- React preview: 4173 (change backend FRONTEND_URL and restart for local API tests).
- Express API: 3000.

Do not run the old Module 4 API on port 3000 at the same time.

## Checks

Frontend: npm run build. Then npm run preview to inspect the production build.
Backend: npm test (stubbed models, no live Atlas connection).
Use the deployment guide for verification with real hosting and Atlas.

## References

- https://mui.com/material-ui/react-grid/
- https://vite.dev/guide/env-and-mode
- https://vite.dev/guide/build
- https://vercel.com/docs/frameworks/frontend/vite
- https://render.com/docs/deploy-node-express-app
