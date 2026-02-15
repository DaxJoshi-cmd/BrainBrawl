import { auth, db } from "./firebase.js";
import { push, ref, set, get }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let currentQuizId = null;

document.getElementById("createQuizBtn").onclick = async () => {
  const title = quizTitle.value;

  const quizRef = push(ref(db, "quizzes"));
  currentQuizId = quizRef.key;

  await set(quizRef, {
    title,
    createdBy: auth.currentUser.uid,
    createdAt: Date.now()
  });

  alert("Quiz Created");
  loadQuizzes();
};

document.getElementById("addQuestionBtn").onclick = async () => {
  if (!currentQuizId) return alert("Create quiz first");

  await push(ref(db, `quizzes/${currentQuizId}/questions`), {
    question: questionText.value,
    options: [opt0.value, opt1.value, opt2.value, opt3.value],
    correctIndex: parseInt(correctIndex.value)
  });

  alert("Question Added");
};

async function loadQuizzes() {
  const snap = await get(ref(db, "quizzes"));
  quizList.innerHTML = "";

  const quizzes = snap.val();
  Object.keys(quizzes).forEach(id => {
    if (quizzes[id].createdBy === auth.currentUser.uid) {
      quizList.innerHTML += `
        <div>
          ${quizzes[id].title}
          <button onclick="window.location='host.html?quiz=${id}'">
            Host
          </button>
        </div>
      `;
    }
  });
}

loadQuizzes();
