import React, {  useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AuthContext } from "./authUtils";


export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [userRoles, setUserRoles] = useState([]);
	const [userClubs, setUserClubs] = useState([]);
	const [loading, setLoading] = useState(true);

	async function loginWithGoogle() {
		const provider = new GoogleAuthProvider();
		provider.setCustomParameters({
			hd: "iitgn.ac.in", // Restrict to IITGN domain
		});

		try {
			const result = await signInWithPopup(auth, provider);
			// User creation is handled by the Firebase function
			return result.user;
		} catch (error) {
			console.error("Error signing in with Google:", error);
			throw error;
		}
	}

	function logout() {
		return signOut(auth);
	}

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(async user => {
			if (user) {
				setCurrentUser(user);

				// Get user data
				const userRef = doc(db, "users", user.uid);
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					const userData = userSnap.data();
					setUserRoles(userData.roles || []);
					setUserClubs(userData.clubAffiliation || []);
				}
			} else {
				setCurrentUser(null);
				setUserRoles([]);
				setUserClubs([]);
			}
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = {
		currentUser,
		userRoles,
		userClubs,
		loginWithGoogle,
		logout,
	};

	return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
