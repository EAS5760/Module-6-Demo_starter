const express = require("express");
const he = require("he");
const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.get("/xss-demo", (req, res) => {
  res.send(`<h1>Comment Demo</h1>
    <form method="POST" action="/comment">
      <textarea name="comment" rows="4" cols="50"></textarea><br>
      <button type="submit">Submit</button>
    </form>`);
});
router.post("/comment", (req, res) => {
  if (typeof req.body?.comment !== "string") {
    return res.status(400).json({ error: "comment must be a string" });
  }
  const safeComment = he.encode(req.body.comment);
  res.send(`<p>${safeComment}</p>`);
});
module.exports = router;
