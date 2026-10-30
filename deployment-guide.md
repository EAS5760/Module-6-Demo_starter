# Deployment walkthrough — no deployment has been performed

Push this folder to a GitHub repository, excluding node_modules, dist, and .env.
The root .gitignore is provided. Commit .env.example templates and lock files.
Do not commit real database credentials or JWT secrets.

## Demo 4: Vercel

1. Import your GitHub repository as a Vercel project.
2. Choose frontend as the Root Directory (not the repository root).
3. Use Vite, build command npm run build, output directory dist.
4. Set VITE_DATA_SOURCE=sample for the initial standalone frontend demo.
5. Deploy and open the deployment URL. Confirm sample task actions work.

These are separate packages: frontend builds with vite build; backend starts with
node server.js. The API does not use react-scripts or a frontend build command.

## Demo 5: Render and Atlas

1. Create a Render Web Service from the same repository.
2. Choose backend as the Root Directory, Node runtime, build command npm ci,
   start command npm start. Use Node 22.12+ or Node 24.
3. Set server environment variables:

| Name | Value |
| --- | --- |
| MONGODB_URI | Your Atlas URI including task_api_demo |
| JWT_SECRET | A random signing secret |
| JWT_EXPIRES_IN | 15m |
| FRONTEND_URL | Exact deployed Vercel origin, with https and no trailing slash |
| CORS_ENABLED | true |

4. Configure Atlas network access to permit the Render service's outbound IP
   addresses shown by Render, and verify the application's database user access.
5. Render provides PORT; the API reads process.env.PORT and listens on it.
6. Deploy, check logs for the Atlas connection message, and open /health.
7. Test /register and /login with Postman; use the token to read GET /tasks.

The backend initializes the unique email index before listening. Atlas credentials
must permit the index creation needed by the Mongoose user model.

## Demo 6: Connect

In Vercel environment settings set:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=https://YOUR-API-HOST
```

Use the actual Render origin without /tasks or /api. No trailing slash is needed.
Set these for the environment you are demonstrating, then redeploy the frontend.
Vite substitutes these values at build time; changing them needs a new build.
Do not place MONGODB_URI or JWT_SECRET in Vercel frontend variables.

In Render, FRONTEND_URL must match the origin you actually open in the browser.
A Vercel preview URL and production URL can have different origins. Apply changes
and redeploy/restart the backend when changing its environment variables.

## End-to-end checks

- The frontend loads and the browser console shows no build errors.
- Register a new account, then sign in. Sign-out removes the in-memory token.
- In Network, requests go to the Render URL, not localhost.
- Create a task and verify the document in Atlas's tasks collection.
- Mark complete; confirm the same document's completed field changes.
- Delete the task; confirm it is removed.
- Reload and sign in again: data persists in Atlas, not React state.

## Debugging

- 401 on GET /tasks: sign in; token may be absent or expired.
- CORS error: check exact FRONTEND_URL protocol/hostname and Vercel environment.
- 404: compare /tasks with requested paths; do not use /api/tasks.
- Network failure: check backend startup, hostname, and availability.
- 500: inspect Render logs and Atlas connectivity, credentials, and indexes.
- Vercel still shows sample data: set VITE_DATA_SOURCE=api and redeploy.
- Build failure: confirm Root Directory, Node version, and npm scripts.
