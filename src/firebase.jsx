// src/firebase.js (hoặc tạo một tệp tương tự)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyB6yhJQ9ob29VuHVFaW5HlJIW8aJSZYV08",
  authDomain: "coinproject-c216c.firebaseapp.com",
  projectId: "coinproject-c216c",
  storageBucket: "coinproject-c216c.firebasestorage.app",
  messagingSenderId: "208968946651",
  appId: "1:208968946651:web:65cdb2219d38225ad44dfe"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
