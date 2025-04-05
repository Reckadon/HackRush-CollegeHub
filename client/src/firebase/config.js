import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
} from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBaS2ls-11HSUja2LcWU8EDSyUL0UwQvG0",
  authDomain: "collegehub---hackrush25.firebaseapp.com",
  projectId: "collegehub---hackrush25",
  storageBucket: "collegehub---hackrush25.firebasestorage.app",
  messagingSenderId: "215049948631",
  appId: "1:215049948631:web:8eac26384bec37af074f92",
};

const app = initializeApp(firebaseConfig);


const db = initializeFirestore(app,{
  localCache: persistentLocalCache(),
});


const auth = getAuth(app);


setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error enabling auth persistence:", error);
});

export const functions = getFunctions(app);


if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { db, auth};
export default app;