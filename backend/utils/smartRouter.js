const axios = require("axios");

async function smartRouteLead(lead) {
    const res = await axios.post(
        process.env.HF_API_URL + "/facebook/bart-large-mnli",
        {
            inputs: `${lead.name} with budget ${lead.budget} from ${lead.location}`
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_API_KEY}`
            }
        }
    );

    const prediction = res.data;
    return prediction; // Add custom logic to interpret and route
}

module.exports = { smartRouteLead };
