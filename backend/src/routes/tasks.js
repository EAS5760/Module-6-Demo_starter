const express = require("express");
const { matchedData } = require("express-validator");
const Task = require("../models/task");
const authRequired = require("../middleware/authRequired");
const { titleRule, completedRule, rejectInvalidInput } = require("../middleware/validation");
const router = express.Router();
function taskError(error, res, message) {
  if (error.name === "CastError" || error.name === "ValidationError") {
    return res.status(400).json({ error: "Invalid task input or ID" });
  }
  return res.status(500).json({ error: message });
}
// Demo 4: request validation runs before the handler.
router.post("/tasks", [titleRule(), completedRule()], rejectInvalidInput, async (req, res) => {
  const data = matchedData(req, { locations: ["body"] });
  try {
    const task = await Task.create({ title: data.title, completed: data.completed ?? false });
    res.status(201).json(task);
  } catch (error) { taskError(error, res, "Could not create task"); }
});
// Demo 8 protects this route only. No per-user ownership filter is implemented.
router.get("/tasks", authRequired, async (req, res) => {
  try { res.json(await Task.find()); }
  catch (error) { taskError(error, res, "Could not retrieve tasks"); }
});
router.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) { taskError(error, res, "Could not retrieve task"); }
});
router.patch("/tasks/:id", [titleRule().optional(), completedRule()], rejectInvalidInput, async (req, res) => {
  const updates = matchedData(req, { locations: ["body"] });
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Provide title or completed" });
  }
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: updates }, {
      returnDocument: "after", runValidators: true
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) { taskError(error, res, "Could not update task"); }
});
router.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (error) { taskError(error, res, "Could not delete task"); }
});
module.exports = router;
