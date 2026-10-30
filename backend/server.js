require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/db");
const app = express();
const PORT = process.env.PORT || 3000;
// Demo 6: disable with CORS_ENABLED=false in .env, then restart.
if (process.env.CORS_ENABLED !== "false") {
  app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5500" }));
}
app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use(require("./src/routes/auth"));
app.use(require("./src/routes/xss"));
app.use(require("./src/routes/tasks"));
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  res.status(500).json({ error: "Internal server error" });
});
async function startServer() {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "replace-with-a-random-secret") {
      throw new Error("Set JWT_SECRET in .env to a random secret");
    }
    await connectDB();
    await require("./src/models/user").init();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}
if (require.main === module) startServer();
module.exports = app;
