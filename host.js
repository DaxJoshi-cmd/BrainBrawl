import { db } from "./firebase.js";
import {
  ref, push, set, update, onValue, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const quizId = new URLSearchParams(window.location.search).get("quiz");

const sessionRef = push(ref(db, "sessions"));
const sessionId = sessionRef.key;

document.getElementById("pin").innerText = sessionId.slice(-6);

await set(sessionRef, {
  quizId,
  status: "waiting",
  currentQuestionIndex: 0
});

let questions = [];
let timerInterval = null;

// Load questions
const qSnap = await get(ref(db, `quizzes/${quizId}/questions`));
questions = Object.values(qSnap.val());

// Start quiz
startBtn.onclick = async () => {
  await update(ref(db, `sessions/${sessionId}`), {
    status: "question",
    questionStartTime: Date.now(),
    questionDuration: 10000 // 10 seconds
  });
};

// Real-time listener
onValue(ref(db, `sessions/${sessionId}`), async (snap) => {
  const data = snap.val();
  if (!data) return;

  const players = data.players || {};
  playerCount.innerText = Object.keys(players).length + " Players";

  if (data.status === "question") {
    showQuestion(data);
    startTimer(data);
  }

  if (data.status === "reveal") {
    clearInterval(timerInterval);
    showLeaderboard(players);
  }
});

// Show question
function showQuestion(data) {
  const q = questions[data.currentQuestionIndex];

  gameArea.innerHTML = `
    <h3>${q.question}</h3>
    <button onclick="revealNow()">Reveal Answer</button>
  `;
}

// Timer logic (SYNCHRONIZED)
function startTimer(data) {
  clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    const remaining =
      data.questionDuration -
      (Date.now() - data.questionStartTime);

    const seconds = Math.max(Math.ceil(remaining / 1000), 0);
    timer.innerText = seconds;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      await revealNow();
    }
  }, 250);
}

// Reveal + Speed Scoring
window.revealNow = async function () {
  const snap = await get(ref(db, `sessions/${sessionId}`));
  const data = snap.val();

  if (data.status === "reveal") return;

  const players = data.players || {};
  const q = questions[data.currentQuestionIndex];

  const updates = {};

  Object.keys(players).forEach(pid => {
    const p = players[pid];

    if (p.answer === q.correctIndex) {

      const timeTaken =
        p.answeredAt - data.questionStartTime;

      const score = Math.max(
        1000 - (timeTaken / 10),
        200
      );

      updates[`sessions/${sessionId}/players/${pid}/score`] =
        (p.score || 0) + score;
    }
  });

  await update(ref(db), updates);

  await update(ref(db, `sessions/${sessionId}`), {
    status: "reveal"
  });
};

// Leaderboard
function showLeaderboard(players) {
  const sorted = Object.values(players)
    .sort((a, b) => b.score - a.score);

  gameArea.innerHTML = `
    <h2>Leaderboard</h2>
    ${sorted.slice(0, 5).map((p, i) =>
      `<div>${i + 1}. ${p.name} - ${Math.round(p.score)}</div>`
    ).join("")}
  `;
}
