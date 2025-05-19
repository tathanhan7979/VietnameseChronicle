import express from "express";
import { createServer } from "http";
import path from "path";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "dist")));

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Handle all other API routes
app.use("/api/*", (req, res) => {
  res.status(503).json({ 
    status: "error", 
    message: "API services are currently under maintenance" 
  });
});

// Serve the front-end application for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

// Start the server
const port = 5000;
const server = createServer(app);

server.listen(
  {
    port,
    host: "0.0.0.0"
  },
  () => {
    console.log(`Server listening on port ${port}`);
  }
);