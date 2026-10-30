# Task API — reused from Module 4

Run npm ci, configure .env with your Atlas URI and a random JWT_SECRET,
then npm run dev. FRONTEND_URL is http://localhost:5173 for this module.
See ../README.md and ../deployment-guide.md.

Routes: /health, /register, /login, /tasks, /tasks/:id.
Only GET /tasks requires authentication, matching Module 4 Demo 8.
There is no per-user ownership filtering; all accounts share demo tasks.
The other CRUD routes remain public as in the demonstration. Use demo data.
The frontend sends its token for all task operations to ease future extension.

npm test runs HTTP behavior tests with database models stubbed (no Atlas).
