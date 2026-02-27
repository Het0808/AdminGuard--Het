import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("admitguard.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    fullName TEXT,
    email TEXT,
    phone TEXT,
    dob TEXT,
    qualification TEXT,
    gradYear INTEGER,
    scoreType TEXT,
    score REAL,
    testScore INTEGER,
    interviewStatus TEXT,
    aadhaar TEXT,
    offerSent TEXT,
    timestamp TEXT,
    exceptions TEXT, -- JSON string
    flagged INTEGER
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/candidates", (req, res) => {
    try {
      const candidates = db.prepare("SELECT * FROM candidates ORDER BY timestamp DESC").all();
      const parsedCandidates = candidates.map((c: any) => ({
        ...c,
        exceptions: JSON.parse(c.exceptions),
        flagged: !!c.flagged
      }));
      res.json(parsedCandidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  app.post("/api/candidates", (req, res) => {
    try {
      const candidate = req.body;
      const stmt = db.prepare(`
        INSERT INTO candidates (
          id, fullName, email, phone, dob, qualification, gradYear, 
          scoreType, score, testScore, interviewStatus, aadhaar, 
          offerSent, timestamp, exceptions, flagged
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        candidate.id,
        candidate.fullName,
        candidate.email,
        candidate.phone,
        candidate.dob,
        candidate.qualification,
        candidate.gradYear,
        candidate.scoreType,
        candidate.score,
        candidate.testScore,
        candidate.interviewStatus,
        candidate.aadhaar,
        candidate.offerSent,
        candidate.timestamp,
        JSON.stringify(candidate.exceptions),
        candidate.flagged ? 1 : 0
      );

      res.status(201).json({ status: "ok" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save candidate" });
    }
  });

  app.delete("/api/candidates/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM candidates WHERE id = ?").run(id);
      res.json({ status: "ok" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
