import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    player VARCHAR(50),
    points INT
  )
`);

// API endpoints
app.get("/scores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT player, SUM(points) as total
      FROM scores
      GROUP BY player
      ORDER BY total ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching scores");
  }
});

app.post("/add", async (req, res) => {
  const { player, points } = req.body;
  try {
    await pool.query(
      `INSERT INTO scores (player, points) VALUES ($1, $2)`,
      [player, points]
    );
    res.send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding score");
  }
});

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
