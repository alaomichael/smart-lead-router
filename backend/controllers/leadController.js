const Lead = require("../models/Lead");
const { smartRouteLead } = require("../utils/smartRouter");

// Simulate routing decision based on AI prediction
function decideTeamFromAI(prediction) {
  // Example logic: route to Enterprise if confidence is high
  if (prediction && prediction[0] && prediction[0].scores[0] > 0.8) {
    return "Enterprise Team";
  }
  return "General Team";
}

const createLead = async (req, res) => {
  try {
    const { name, email, location, budget } = req.body;

    // Run AI-based routing logic
    const prediction = await smartRouteLead({ name, location, budget });
    const assignedTeam = decideTeamFromAI(prediction);

    const newLead = new Lead({
      name,
      email,
      location,
      budget,
      assignedTeam
    });

    await newLead.save();

    // Emit event via Socket.io
    req.io.emit("newLead", newLead);

    res.status(201).json(newLead);
  } catch (error) {
    console.error("Error creating lead:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createLead,
  getLeads
};
