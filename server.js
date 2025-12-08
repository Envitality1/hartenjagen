import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const PLAYERS = ["vince", "sam", "koen", "olivier", "boaz", "leon"];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    player VARCHAR(50),
    points INT
  )
`);

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

app.post("/add-round", async (req, res) => {
  try {
    const { scores } = req.body;

    if (!scores) return res.status(400).send("Missing scores");

    const client = await pool.connect();
    await client.query("BEGIN");

    // Fetch current totals
    const totalsResult = await client.query(`
      SELECT player, COALESCE(SUM(points),0) AS total 
      FROM scores 
      GROUP BY player
    `);

    const currentTotals = Object.fromEntries(
      PLAYERS.map(p => [p, 0])
    );

    totalsResult.rows.forEach(row => {
      currentTotals[row.player] = Number(row.total);
    });

    for (const player of PLAYERS) {
      const addValue = Number(scores[player]);
      if (!Number.isFinite(addValue)) continue;

      const current = currentTotals[player];
      let potential = current + addValue;

      // Mirror rule
      if (potential < 0) potential = Math.abs(potential);

      const adjusted = potential - current;

      if (adjusted !== 0) {
        await client.query(
          `INSERT INTO scores (player, points) VALUES ($1, $2)`,
          [player, adjusted]
        );

        currentTotals[player] = potential;
      }
    }

    await client.query("COMMIT");
    client.release();

    await pool.query(`INSERT INTO rounds (data) VALUES ($1)`, [scores]);

  res.json({ ok: true, newTotals: currentTotals });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error applying round");
  }
});


// Create history table if not exists
await pool.query(`
  CREATE TABLE IF NOT EXISTS rounds (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    data JSONB
  )
`);

app.get("/history", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT data, created_at 
      FROM rounds 
      ORDER BY id DESC 
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching history");
  }
});


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
