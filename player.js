import { db } from "./firebase.js";
import {
  ref, get, push, update, onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let sessionId = null;
let playerId = null;

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

function listen() {
  onValue(ref(db, `sessions/${sessionId}`), async (snap) => {
    const data = snap.val();
    if (!data) return;

    if (data.status === "question") {
      const quizSnap = await get(ref(db, `quizzes/${data.quizId}/questions`));
      const questions = Object.values(quizSnap.val());
      const q = questions[data.currentQuestionIndex];

      gameArea.innerHTML = `
        <h3>${q.question}</h3>
        ${q.options.map((opt,i) =>
          `<button onclick="answer(${i})">${opt}</button>`
        ).join("")}
      `;
    }

    if (data.status === "reveal") {
      const me = data.players[playerId];
      gameArea.innerHTML = `
        <h3>Reveal!</h3>
        <p>Your Score: ${Math.round(me.score)}</p>
      `;
    }
  });
}

window.answer = async function(index) {
  await update(ref(db, `sessions/${sessionId}/players/${playerId}`), {
    answer: index,
    answeredAt: Date.now()
  });

  gameArea.innerHTML = "Answer Submitted!";
};
