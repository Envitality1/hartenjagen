const PLAYERS = ["vince", "sam", "koen", "olivier", "boaz", "leon"];

async function loadScores() {
  const res = await fetch("/scores");
  const data = await res.json();
  
  document.getElementById("scoreboard").innerHTML = `
    <table>
      <tr><th>Speler</th><th>Totaal</th></tr>
      ${data.map(r => `<tr><td>${r.player}</td><td>${r.total}</td></tr>`).join("")}
    </table>
  `;
}

async function loadHistory() {
  const res = await fetch("/history");
  const data = await res.json();

  document.getElementById("history").innerHTML = data.map((row, i) => `
    <div class="round">
      <strong>Ronde ${i + 1} (${new Date(row.created_at).toLocaleString()}):</strong>
      <pre>${JSON.stringify(row.data, null, 2)}</pre>
    </div>
  `).join("");
}

document.getElementById("roundForm").addEventListener("submit", async e => {
  e.preventDefault();

  const scores = {};
  PLAYERS.forEach(p => scores[p] = Number(document.getElementById(p).value));

  await fetch("/add-round", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scores })
  });

  // Reset form to 0
  PLAYERS.forEach(p => document.getElementById(p).value = 0);

  // Refresh UI
  await loadScores();
  await loadHistory();
});

// Initial load
loadScores();
loadHistory();
