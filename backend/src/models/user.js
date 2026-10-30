const { mongoose } = require("../db");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});
module.exports = mongoose.model("User", userSchema);
