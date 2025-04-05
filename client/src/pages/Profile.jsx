import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authUtils";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Profile.css";
import EventCard from "../components/Events/EventCard";

const Profile = () => {
	const { currentUser } = useAuth();
	const [userData, setUserData] = useState(null);
	const [userClubs, setUserClubs] = useState([]);
	const [userEvents, setUserEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState("");
	const [bio, setBio] = useState("");

	useEffect(() => {
		const fetchUserData = async () => {
			if (currentUser) {
				try {
					const userRef = doc(db, "users", currentUser.uid);
					const userSnap = await getDoc(userRef);

					if (userSnap.exists()) {
						setUserData(userSnap.data());
						setName(userSnap.data().displayName || "");
						setBio(userSnap.data().bio || "");
					}
					// Fetch user's clubs
					const clubs = userSnap.data().clubAffiliation || [];
					const clubsData = await Promise.all(
						clubs.map(async clubId => {
							const clubRef = doc(db, "clubsCollection", clubId);
							const clubSnap = await getDoc(clubRef);
							return { id: clubId, ...clubSnap.data() };
						})
					);
					// Fetch user's events
					// Fetch user's events
					const events = userSnap.data().participation || [];
					const eventsData = await Promise.all(
						events.map(async eventId => {
							try {
								const eventRef = doc(db, "eventsCollection", eventId);
								const eventSnap = await getDoc(eventRef);

								if (eventSnap.exists()) {
									const eventData = eventSnap.data();
									return {
										id: eventId,
										...eventData,
										date:
											eventData.date &&
											(eventData.date.toDate
												? eventData.date.toDate()
												: new Date(eventData.date)),
									};
								}
								return null;
							} catch (error) {
								console.error(`Error fetching event ${eventId}:`, error);
								return null;
							}
						})
					);

					// Filter out any null values (events that couldn't be fetched)
					const validEventsData = eventsData.filter(event => event !== null);
					setUserEvents(validEventsData);
					setUserClubs(clubsData);
					setLoading(false);
				} catch (error) {
					console.error("Error fetching user data:", error);
					setLoading(false);
				}
			}
		};

		fetchUserData();
	}, [currentUser]);

	const handleSave = async () => {
		try {
			const userRef = doc(db, "users", currentUser.uid);
			await updateDoc(userRef, {
				displayName: name,
				bio: bio,
			});

			setUserData({
				...userData,
				displayName: name,
				bio: bio,
			});

			setEditing(false);
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	if (loading) {
		return <div className="loading">Loading profile...</div>;
	}

	return (
		<div className="profile-container">
			<div className="profile-header">
				<div className="profile-avatar">
					{currentUser?.photoURL ? (
						<img src={currentUser.photoURL} alt="Profile" />
					) : (
						<div className="profile-initial-big">
							{currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
						</div>
					)}
				</div>
				<div className="profile-info">
					{editing ? (
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							className="edit-name"
						/>
					) : (
						<h1>{userData?.displayName || currentUser?.displayName}</h1>
					)}
					<p className="profile-email">{currentUser?.email}</p>
					<div className="profile-roles">
						{userData?.roles && userData.roles.length > 0 ? (
							userData.roles.map((role, index) => (
								<span key={index} className="role-badge">
									{role}
								</span>
							))
						) : (
							<span className="role-badge">Student</span>
						)}
					</div>
				</div>
				{!editing ? (
					<button className="edit-profile-btn" onClick={() => setEditing(true)}>
						Edit Profile
					</button>
				) : (
					<button className="save-profile-btn" onClick={handleSave}>
						Save
					</button>
				)}
			</div>

			<div className="profile-body">
				<div className="profile-section">
					<h2>About Me</h2>
					{editing ? (
						<textarea
							value={bio}
							onChange={e => setBio(e.target.value)}
							className="edit-bio"
							placeholder="Tell us about yourself..."
						/>
					) : (
						<p>{userData?.bio || "No bio provided yet."}</p>
					)}
				</div>

				<div className="profile-section">
					<h2>Club Affiliations</h2>
					{userData?.clubAffiliation && userData.clubAffiliation.length > 0 ? (
						<ul className="clubs-list">
							{userClubs.map((club, index) => (
								<li key={index} className="club-item">
									{club.name}
								</li>
							))}
						</ul>
					) : (
						<p>Not affiliated with any clubs yet.</p>
					)}
				</div>

				<div className="profile-section">
					<h2>Registered Events</h2>
					{userData?.participation && userData.participation.length > 0 ? (
						<ul className="events-list">
							{userEvents.map((event, index) => <EventCard key={index} event={event} isShort={true}/>)}
						</ul>
					) : (
						<p>No registered events.</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
