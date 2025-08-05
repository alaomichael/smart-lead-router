
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.DB_URL).then(() => console.log("MongoDB connected"));

app.use(cors());
app.use(express.json());

io.on("connection", socket => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
});

app.use("/api/leads", require("./routes/leadRoutes")(io));

server.listen(5000, () => console.log("Server running on port 5000"));
