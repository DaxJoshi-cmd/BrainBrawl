import { db } from "./firebase.js";
import {
  ref, push, set, onValue, update, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const quizId = new URLSearchParams(window.location.search).get("quiz");

const sessionRef = push(ref(db, "sessions"));
const sessionId = sessionRef.key;

pin.innerText = sessionId.slice(-6);

await set(sessionRef, {
  quizId,
  status: "waiting",
  currentQuestionIndex: 0
});

let questions = [];

const qSnap = await get(ref(db, `quizzes/${quizId}/questions`));
questions = Object.values(qSnap.val());

startBtn.onclick = async () => {
  await update(ref(db, `sessions/${sessionId}`), {
    status: "question",
    questionStartTime: Date.now()
  });
};

onValue(ref(db, `sessions/${sessionId}`), (snap) => {
  const data = snap.val();
  if (!data) return;

  const players = data.players || {};
  playerCount.innerText = Object.keys(players).length + " Players";

  if (data.status === "question") {
    const q = questions[data.currentQuestionIndex];
    gameArea.innerHTML = `
      <h3>${q.question}</h3>
      <button onclick="reveal()">Reveal</button>
    `;
  }

  if (data.status === "reveal") {
    showLeaderboard(players);
  }
});

window.reveal = async function() {
  const snap = await get(ref(db, `sessions/${sessionId}`));
  const data = snap.val();
  const players = data.players || {};
  const q = questions[data.currentQuestionIndex];

  const updates = {};

  Object.keys(players).forEach(pid => {
    const p = players[pid];

    if (p.answer === q.correctIndex) {
      const time = p.answeredAt - data.questionStartTime;
      const score = Math.max(1000 - time / 10, 200);
      updates[`sessions/${sessionId}/players/${pid}/score`] =
        (p.score || 0) + score;
    }
  });

  await update(ref(db), updates);
  await update(ref(db, `sessions/${sessionId}`), { status: "reveal" });
};

function showLeaderboard(players) {
  const sorted = Object.values(players)
    .sort((a, b) => b.score - a.score);

  gameArea.innerHTML = `
    <h2>Leaderboard</h2>
    ${sorted.slice(0,5).map((p,i) =>
      `<div>${i+1}. ${p.name} - ${Math.round(p.score)}</div>`
    ).join("")}
  `;
}
