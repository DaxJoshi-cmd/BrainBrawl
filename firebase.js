import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJUiaiY-cJ0X9WnhwtMZxyj_CmYrrMQIc",
  authDomain: "brainbrawl-bdae7.firebaseapp.com",
  databaseURL: "https://brainbrawl-bdae7-default-rtdb.firebaseio.com/",
  projectId: "brainbrawl-bdae7",
  storageBucket: "brainbrawl-bdae7.firebasestorage.app",
  messagingSenderId: "335287637950",
  appId: "1:335287637950:web:c2f7eb0500888521928bef"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

 