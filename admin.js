import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref, set, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let adminEmail;
let adminPassword;

// Verify admin
const snap = await get(ref(db, "users/" + auth.currentUser.uid));
if (snap.val().role !== "admin") {
  alert("Access Denied");
  window.location = "index.html";
}

// Store admin credentials for re-login
adminEmail = auth.currentUser.email;

createUserBtn.onclick = async () => {

  const password = newPassword.value;

  const userCred = await createUserWithEmailAndPassword(
    auth,
    newEmail.value,
    password
  );

  await set(ref(db, "users/" + userCred.user.uid), {
    name: newName.value,
    email: newEmail.value,
    role: newRole.value,
    status: "active"
  });

  alert("User Created");

  // Re-login as admin
  await signInWithEmailAndPassword(auth, adminEmail, password);
};
