import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { ref, get }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = email.value;
  const password = password.value;
  await signInWithEmailAndPassword(auth, email, password);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await get(ref(db, "users/" + user.uid));
  const data = snap.val();

  if (data.status !== "active") {
    alert("Account disabled");
    await signOut(auth);
    return;
  }

  if (data.role === "teacher") {
    window.location = "teacher.html";
  }
});
