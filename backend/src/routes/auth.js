const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, matchedData } = require("express-validator");
const User = require("../models/user");
const { rejectInvalidInput } = require("../middleware/validation");
const router = express.Router();
function credentialRules() {
  return [
    body("email").isString().withMessage("email must be a string").bail()
      .trim().isEmail().withMessage("A valid email is required"),
    body("password").isString().withMessage("password must be a string").bail()
      .isLength({ min: 8 }).withMessage("password must have at least 8 characters").bail()
      .custom(value => Buffer.byteLength(value, "utf8") <= 72)
      .withMessage("password must not exceed 72 bytes")
  ];
}
router.post("/register", credentialRules(), rejectInvalidInput, async (req, res) => {
  const { email, password } = matchedData(req, { locations: ["body"] });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Email already in use" });
    res.status(500).json({ error: "Could not register user" });
  }
});
router.post("/login", credentialRules(), rejectInvalidInput, async (req, res) => {
  const { email, password } = matchedData(req, { locations: ["body"] });
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
      algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "15m"
    });
    res.json({ token });
  } catch (error) { res.status(500).json({ error: "Could not log in" }); }
});
module.exports = router;
