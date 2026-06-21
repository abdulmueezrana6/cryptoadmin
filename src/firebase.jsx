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

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB6yhJQ9ob29VuHVFaW5HlJIW8aJSZYV08",
//   authDomain: "coinproject-c216c.firebaseapp.com",
//   projectId: "coinproject-c216c",
//   storageBucket: "coinproject-c216c.firebasestorage.app",
//   messagingSenderId: "208968946651",
//   appId: "1:208968946651:web:65cdb2219d38225ad44dfe"
// };

const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LcvoPgrAAAAANhl9jH3JG4bqiHm56FVa1wem3pJ"),
  isTokenAutoRefreshEnabled: true, 
});
const db = getFirestore(app);

export { db };
