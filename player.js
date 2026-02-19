import { db } from "./firebase.js";
import {
  ref, get, push, update, onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let sessionId = null;
let playerId = null;
let timerInterval = null;

// Join
joinBtn.onclick = async () => {
  const pin = pinInput.value;
  const name = nameInput.value;

  const snap = await get(ref(db, "sessions"));
  const sessions = snap.val();

  Object.keys(sessions).forEach(id => {
    if (id.slice(-6) === pin) sessionId = id;
  });

  if (!sessionId) return alert("Invalid PIN");

  const playerRef = push(ref(db, `sessions/${sessionId}/players`));
  playerId = playerRef.key;

  await update(playerRef, {
    name,
    score: 0
  });

  listen();
};

// Listen
function listen() {
  onValue(ref(db, `sessions/${sessionId}`), async (snap) => {
    const data = snap.val();
    if (!data) return;

    if (data.status === "question") {
      showQuestion(data);
      startTimer(data);
    }

    if (data.status === "reveal") {
      clearInterval(timerInterval);
      showReveal(data);
    }
  });
}

// Show question
async function showQuestion(data) {
  const quizSnap = await get(ref(db, `quizzes/${data.quizId}/questions`));
  const questions = Object.values(quizSnap.val());
  const q = questions[data.currentQuestionIndex];

  gameArea.innerHTML = `
    <h3>${q.question}</h3>
    ${q.options.map((opt, i) =>
      `<button onclick="submitAnswer(${i})">${opt}</button>`
    ).join("")}
  `;
}

// SYNCHRONIZED TIMER
function startTimer(data) {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const remaining =
      data.questionDuration -
      (Date.now() - data.questionStartTime);

    const seconds = Math.max(Math.ceil(remaining / 1000), 0);
    timer.innerText = seconds;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      gameArea.innerHTML = "Time's Up!";
    }
  }, 250);
}

// Prevent Late Answers
window.submitAnswer = async function(index) {

  const snap = await get(ref(db, `sessions/${sessionId}`));
  const data = snap.val();

  const remaining =
    data.questionDuration -
    (Date.now() - data.questionStartTime);

  if (remaining <= 0) {
    alert("Too late!");
    return;
  }

  await update(ref(db, `sessions/${sessionId}/players/${playerId}`), {
    answer: index,
    answeredAt: Date.now()
  });

  gameArea.innerHTML = "Answer Submitted!";
};

// Reveal screen
function showReveal(data) {
  const me = data.players[playerId];

  gameArea.innerHTML = `
    <h3>Answer Revealed!</h3>
    <p>Your Score: ${Math.round(me.score)}</p>
  `;
}
