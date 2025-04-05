import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to Firebase Emulators for local development
if (window.location.hostname === "localhost") {
	connectAuthEmulator(auth, "http://localhost:9099");
	connectFirestoreEmulator(db, "localhost", 8080);
}

export default app;
