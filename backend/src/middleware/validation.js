const { body, validationResult } = require("express-validator");
function titleRule() {
  return body("title")
    .isString().withMessage("title must be a string").bail()
    .trim().notEmpty().withMessage("title is required").bail()
    .isLength({ max: 100 }).withMessage("title must be at most 100 characters");
}
function completedRule() {
  return body("completed").optional()
    .custom(value => typeof value === "boolean")
    .withMessage("completed must be a boolean");
}
function rejectInvalidInput(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(error => ({
      field: error.path, message: error.msg
    })) });
  }
  next();
}
module.exports = { titleRule, completedRule, rejectInvalidInput };
