// src/firebase.js (hoặc tạo một tệp tương tự)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAAnMb9oIziWEsL8AFAqU_58QFwfYc3JRI",
  authDomain: "jupproject-619e2.firebaseapp.com",
  projectId: "jupproject-619e2",
  storageBucket: "jupproject-619e2.firebasestorage.app",
  messagingSenderId: "878726482861",
  appId: "1:878726482861:web:5bd0d7805cef5ad1486f24"
};


const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LdPaPgrAAAAANaLOU53rpAwTu7BDAmyHoCv6Xhk"),
  isTokenAutoRefreshEnabled: true, // tự động làm mới token
});
const db = getFirestore(app);

export { db };
