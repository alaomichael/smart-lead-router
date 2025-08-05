const { Server } = require("socket.io");

class SocketManager {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.connectedClients = new Map();
        this.teamRooms = new Set();

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.io.on("connection", (socket) => {
            console.log(`Client connected: ${socket.id}`);
            this.connectedClients.set(socket.id, {
                connectedAt: new Date(),
                team: null
            });

            // Handle team subscription
            socket.on("subscribe-to-team", (teamName) => {
                this.subscribeToTeam(socket, teamName);
            });

            // Handle unsubscribe from team
            socket.on("unsubscribe-from-team", (teamName) => {
                this.unsubscribeFromTeam(socket, teamName);
            });

            // Handle lead status updates
            socket.on("update-lead-status", (data) => {
                this.handleLeadStatusUpdate(socket, data);
            });

            // Handle team member joining
            socket.on("join-team", (teamData) => {
                this.handleTeamJoin(socket, teamData);
            });

            // Handle disconnect
            socket.on("disconnect", () => {
                this.handleDisconnect(socket);
            });

            // Send connection confirmation
            socket.emit("connection-confirmed", {
                socketId: socket.id,
                connectedAt: new Date(),
                availableTeams: Array.from(this.teamRooms)
            });
        });
    }

    subscribeToTeam(socket, teamName) {
        if (!teamName) return;

        socket.join(teamName);
        this.teamRooms.add(teamName);

        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
            clientInfo.team = teamName;
        }

        console.log(`Client ${socket.id} subscribed to team: ${teamName}`);
        socket.emit("team-subscribed", { team: teamName });

        // Notify team members of new subscriber
        socket.to(teamName).emit("team-member-joined", {
            socketId: socket.id,
            team: teamName,
            timestamp: new Date()
        });
    }

    unsubscribeFromTeam(socket, teamName) {
        if (!teamName) return;

        socket.leave(teamName);

        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo && clientInfo.team === teamName) {
            clientInfo.team = null;
        }

        console.log(`Client ${socket.id} unsubscribed from team: ${teamName}`);
        socket.emit("team-unsubscribed", { team: teamName });

        // Notify team members of member leaving
        socket.to(teamName).emit("team-member-left", {
            socketId: socket.id,
            team: teamName,
            timestamp: new Date()
        });
    }

    handleTeamJoin(socket, teamData) {
        const { teamName, userInfo } = teamData;
        if (!teamName) return;

        this.subscribeToTeam(socket, teamName);

        // Store additional user info
        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo) {
            clientInfo.userInfo = userInfo;
        }

        // Broadcast team join to team members
        socket.to(teamName).emit("new-team-member", {
            socketId: socket.id,
            userInfo,
            team: teamName,
            timestamp: new Date()
        });
    }

    handleLeadStatusUpdate(socket, data) {
        const { leadId, status, teamName, assignedTo } = data;

        console.log(`Lead status update: ${leadId} -> ${status} by ${socket.id}`);

        // Broadcast to all clients
        this.io.emit("lead-status-updated", {
            leadId,
            status,
            updatedBy: socket.id,
            timestamp: new Date(),
            assignedTo
        });

        // Broadcast to specific team if provided
        if (teamName) {
            this.io.to(teamName).emit("team-lead-updated", {
                leadId,
                status,
                teamName,
                updatedBy: socket.id,
                timestamp: new Date()
            });
        }
    }

    handleDisconnect(socket) {
        console.log(`Client disconnected: ${socket.id}`);

        const clientInfo = this.connectedClients.get(socket.id);
        if (clientInfo && clientInfo.team) {
            // Notify team members of disconnection
            socket.to(clientInfo.team).emit("team-member-disconnected", {
                socketId: socket.id,
                team: clientInfo.team,
                timestamp: new Date()
            });
        }

        this.connectedClients.delete(socket.id);
    }

    // Method to emit new lead to all clients and specific team
    emitNewLead(lead) {
        console.log(`Broadcasting new lead: ${lead.name} -> ${lead.assignedTeam}`);

        // Emit to all connected clients
        this.io.emit("new-lead", lead);

        // Emit to specific team room
        if (lead.assignedTeam) {
            this.io.to(lead.assignedTeam).emit("team-new-lead", {
                ...lead,
                timestamp: new Date()
            });
        }
    }

    // Method to get connected clients info
    getConnectedClientsInfo() {
        const clientsInfo = {};
        this.connectedClients.forEach((info, socketId) => {
            clientsInfo[socketId] = info;
        });
        return {
            totalConnected: this.connectedClients.size,
            clients: clientsInfo,
            activeTeams: Array.from(this.teamRooms)
        };
    }

    // Method to emit lead assignment notification
    emitLeadAssignment(leadData) {
        const { lead, assignedTeam, assignedBy } = leadData;

        this.io.emit("lead-assigned", {
            lead,
            assignedTeam,
            assignedBy,
            timestamp: new Date()
        });

        if (assignedTeam) {
            this.io.to(assignedTeam).emit("team-lead-assigned", {
                lead,
                assignedBy,
                timestamp: new Date()
            });
        }
    }

    // Method to broadcast system notifications
    broadcastNotification(notification) {
        this.io.emit("system-notification", {
            ...notification,
            timestamp: new Date()
        });
    }

    // Method to send team-specific notifications
    sendTeamNotification(teamName, notification) {
        if (!teamName) return;

        this.io.to(teamName).emit("team-notification", {
            ...notification,
            team: teamName,
            timestamp: new Date()
        });
    }

    // Method to broadcast lead routing statistics
    broadcastLeadStats(stats) {
        this.io.emit("lead-stats-updated", {
            ...stats,
            timestamp: new Date()
        });
    }

    // Method to handle lead claim by team member
    handleLeadClaim(socket, leadData) {
        const { leadId, teamName, claimedBy } = leadData;

        console.log(`Lead ${leadId} claimed by ${claimedBy} from team ${teamName}`);

        // Broadcast to all clients
        this.io.emit("lead-claimed", {
            leadId,
            claimedBy,
            teamName,
            timestamp: new Date()
        });

        // Notify team members
        if (teamName) {
            this.io.to(teamName).emit("team-lead-claimed", {
                leadId,
                claimedBy,
                timestamp: new Date()
            });
        }
    }

    // Method to emit team performance metrics
    emitTeamPerformance(teamName, metrics) {
        if (!teamName) return;

        this.io.to(teamName).emit("team-performance", {
            team: teamName,
            metrics,
            timestamp: new Date()
        });
    }

    // Method to broadcast system-wide alerts
    broadcastAlert(alert) {
        this.io.emit("system-alert", {
            ...alert,
            type: alert.type || "info",
            timestamp: new Date()
        });
    }

    // Method to get team-specific stats
    getTeamStats(teamName) {
        const teamMembers = [];
        this.connectedClients.forEach((info, socketId) => {
            if (info.team === teamName) {
                teamMembers.push({
                    socketId,
                    ...info
                });
            }
        });

        return {
            teamName,
            memberCount: teamMembers.length,
            members: teamMembers,
            isActive: this.teamRooms.has(teamName)
        };
    }

    // Method to force disconnect all clients from a team
    disconnectTeam(teamName, reason = "Team session ended") {
        if (!this.teamRooms.has(teamName)) return;

        this.io.to(teamName).emit("team-disconnected", {
            team: teamName,
            reason,
            timestamp: new Date()
        });

        // Remove team room
        this.teamRooms.delete(teamName);

        // Update client info
        this.connectedClients.forEach((info, socketId) => {
            if (info.team === teamName) {
                info.team = null;
            }
        });

        console.log(`Team ${teamName} disconnected: ${reason}`);
    }
}

module.exports = SocketManager;