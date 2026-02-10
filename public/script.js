const PLAYERS = ["vince", "sam", "koen", "olivier", "boaz", "leon"];

const PLAYER_LABELS = {
  vince: "Vince",
  sam: "Sam",
  koen: "Koen",
  olivier: "Tamir + Olivier",
  boaz: "Boaz",
  leon: "Leon"
};

async function loadScores() {
  const res = await fetch("/scores");
  const data = await res.json();
  
  document.getElementById("scoreboard").innerHTML = `
    <table>
      <tr><th>Speler</th><th>Totaal</th></tr>
      ${data.map(r => `
        <tr>
          <td>${PLAYER_LABELS[r.player] ?? r.player}</td>
          <td>${r.total}</td>
        </tr>
`).join("")}

    </table>
  `;
}

async function loadHistory() {
  const res = await fetch("/history");
  const data = await res.json();

  document.getElementById("history").innerHTML = data.map((row, i) => {
    const entries = Object.entries(row.data)
      .filter(([, v]) => v !== 0)
      .map(([player, points]) => `
        <tr>
          <td>${PLAYER_LABELS[player] ?? player}</td>
          <td>${points > 0 ? "+" + points : points}</td>
        </tr>
      `).join("");

    return `
      <div class="round">
        <strong>Ronde ${data.length - i}</strong>
        <span class="time">${new Date(row.created_at).toLocaleString()}</span>
        <table>
          <tr><th>Speler</th><th>Punten</th></tr>
          ${entries || `<tr><td colspan="2">Geen punten</td></tr>`}
        </table>
      </div>
    `;
  }).join("");
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


//TEAM NAMEN

// Tamir + Olivier: Olimier

//Alan + Leon: Lallan

//Vince: Vince

//Sam: Sam

//Boax: Boaz

//Koen: Koen