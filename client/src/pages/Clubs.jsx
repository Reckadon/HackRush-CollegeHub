import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import {
	collection,
	query,
	getDocs,
	doc,
	updateDoc,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";
import "./Clubs.css";

const Clubs = () => {
	const { currentUser, userClubs } = useAuth();
	const [clubs, setClubs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchClubs() {
			try {
				const clubsQuery = query(collection(db, "clubsCollection"));
				const clubsSnapshot = await getDocs(clubsQuery);
				const clubsData = clubsSnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
					isSubscribed: userClubs.includes(doc.data().clubId),
				}));

				setClubs(clubsData);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching clubs:", error);
				setLoading(false);
			}
		}

		fetchClubs();
	}, [userClubs]);

	const handleSubscribe = async (clubId, isSubscribed) => {
		try {
			const clubRef = doc(db, "clubsCollection", clubId);
			const userRef = doc(db, "users", currentUser.uid);

			if (isSubscribed) {
				// Unsubscribe
				await updateDoc(clubRef, {
					members: arrayRemove(currentUser.uid),
				});

				await updateDoc(userRef, {
					clubAffiliation: arrayRemove(clubId),
				});
			} else {
				// Subscribe
				await updateDoc(clubRef, {
					members: arrayUnion(currentUser.uid),
				});

				await updateDoc(userRef, {
					clubAffiliation: arrayUnion(clubId),
				});
			}

			// Update UI
			window.location.reload();
		} catch (error) {
			console.error("Error updating subscription:", error);
			alert("Failed to update subscription. Please try again.");
		}
	};

	if (loading) {
		return <div className="loading">Loading clubs...</div>;
	}

	return (
		<div className="clubs-container">
			<h1>IITGN Clubs</h1>

			<div className="clubs-grid">
				{clubs.map(club => (
					<div key={club.id} className="club-card">
						{club.clubPhoto && (
							<div className="club-photo">
								<img src={club.clubPhoto} alt={club.name} />
							</div>
						)}

						<div className="club-content">
							<h2>{club.name}</h2>
							<p className="club-description">{club.description}</p>
							<p className="club-members">{club.members?.length || 0} members</p>

							<button
								className={`subscribe-btn ${club.isSubscribed ? "subscribed" : ""}`}
								onClick={() => handleSubscribe(club.id, club.isSubscribed)}
							>
								{club.isSubscribed ? "Unsubscribe" : "Subscribe"}
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Clubs;
