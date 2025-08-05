
function routeLead(lead) {
  if (lead.budget > 10000) return "Enterprise";
  if (lead.location.toLowerCase().includes("africa")) return "Africa Sales";
  return "General";
}

module.exports = { routeLead };
