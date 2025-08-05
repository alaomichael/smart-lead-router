
const express = require("express");
const router = express.Router();
const { createLead } = require("../controllers/leadController");

module.exports = (io) => {
  router.post("/", (req, res) => createLead(req, res, io));
  return router;
};
