
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Dashboard() {
  const [leads, setLeads] = useState([]);

  // useEffect(() => {
  //   socket.on("new-lead", (lead) => {
  //     setLeads(prev => [lead, ...prev]);
  //   });
  // }, []);

  useEffect(() => {
    socket.on("new-lead", data => setLeads(prev => [data, ...prev]));
    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Incoming Leads</h2>
      <ul>
        {leads.map((lead, index) => (
          <li key={index}>
            {lead.name} - ${lead.budget} - Assigned: {lead.assignedTeam}
          </li>
        ))}
      </ul>
    </div>
  );
}
