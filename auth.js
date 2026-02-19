import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { ref, get }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

loginBtn.onclick = async () => {
  await signInWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );
};

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await get(ref(db, "users/" + user.uid));
  if (!snap.exists()) {
    alert("User record missing");
    return;
  }

  const data = snap.val();

  if (data.status !== "active") {
    alert("Account disabled");
    await signOut(auth);
    return;
  }

  if (data.role === "admin") {
    window.location = "admin.html";
  } else if (data.role === "teacher") {
    window.location = "teacher.html";
  }
});
