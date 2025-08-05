
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  budget: Number,
  location: String,
  assignedTeam: String,
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);
