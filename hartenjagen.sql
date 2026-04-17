-- =========================
-- HARTENJAGEN DATABASE SETUP
-- =========================

-- Drop oude tabellen (veilig bij reset)
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS rounds;

-- =========================
-- SCORES TABLE
-- =========================

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    player VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index voor snelle berekeningen
CREATE INDEX idx_scores_player ON scores(player);

-- =========================
-- ROUNDS HISTORY
-- =========================

CREATE TABLE rounds (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    data JSONB NOT NULL
);

CREATE INDEX idx_rounds_created_at ON rounds(created_at DESC);



-- =========================
-- TEST QUERY
-- =========================

SELECT player, SUM(points) AS total
FROM scores
GROUP BY player
ORDER BY total ASC;