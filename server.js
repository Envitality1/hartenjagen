import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Replace these with your Render DB credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    player VARCHAR(50),
    points INT
  )
`);

app.get("/scores", async (req, res) => {
  const result = await pool.query(`
    SELECT player, SUM(points) as total
    FROM scores
    GROUP BY player
    ORDER BY total ASC
  `);
  res.json(result.rows);
});

app.post("/add", async (req, res) => {
  const { player, points } = req.body;
  await pool.query(`INSERT INTO scores (player, points) VALUES ($1, $2)`, [player, points]);
  res.send("OK");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
