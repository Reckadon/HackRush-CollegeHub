import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authUtils";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import EventCard from "../components/Events/EventCard";
import NoticeCard from "../components/NoticeBoard/NoticeCard";
import "./Dashboard.css";

const Dashboard = () => {
	const { currentUser, userRoles, userClubs } = useAuth();
	const [upcomingEvents, setUpcomingEvents] = useState([]);
	const [recentNotices, setRecentNotices] = useState([]);
	const [userClubData, setUserClubData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchDashboardData() {
			try {
				// Fetch upcoming events
				const now = new Date();
				const eventsQuery = query(
					collection(db, "eventsCollection"),
					where("date", ">=", now),
					where("isActive", "==", true),
					where("isApproved", "==", true),
					orderBy("date"),
					limit(5)
				);
				const eventsSnapshot = await getDocs(eventsQuery);
				const eventsData = eventsSnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}));
				setUpcomingEvents(eventsData);

				// Fetch recent notices
				const noticesQuery = query(
					collection(db, "noticesCollection"),
					orderBy("createdAt", "desc"),
					limit(5)
				);
				const noticesSnapshot = await getDocs(noticesQuery);
				const noticesData = noticesSnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}));
				setRecentNotices(noticesData);

				// Fetch user's clubs
				if (userClubs && userClubs.length > 0) {
					const userClubsQuery = query(
						collection(db, "clubsCollection"),
						where("clubId", "in", userClubs)
					);
					const userClubsSnapshot = await getDocs(userClubsQuery);
					const userClubsData = userClubsSnapshot.docs.map(doc => ({
						id: doc.id,
						...doc.data(),
					}));
					setUserClubData(userClubsData);
				}

				setLoading(false);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				setLoading(false);
			}
		}

		fetchDashboardData();
	}, [userClubs]);

	if (loading) {
		return <div className="loading">Loading dashboard...</div>;
	}

	return (
		<div className="dashboard-container">
			<h1>Welcome, {currentUser?.displayName}</h1>
			<p>Roles: {userRoles.length > 0 ? userRoles.join(", ") : "Student"}</p>

			<div className="dashboard-section">
				<h2>Upcoming Events</h2>
				<div className="events-grid">
					{upcomingEvents.length > 0 ? (
						upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
					) : (
						<p>No upcoming events</p>
					)}
				</div>
			</div>

			<div className="dashboard-section">
				<h2>Recent Notices</h2>
				<div className="notices-list">
					{recentNotices.length > 0 ? (
						recentNotices.map(notice => <NoticeCard key={notice.id} notice={notice} />)
					) : (
						<p>No recent notices</p>
					)}
				</div>
			</div>

			<div className="dashboard-section">
				<h2>Your Clubs</h2>
				<div className="clubs-grid">
					{userClubData.length > 0 ? (
						userClubData.map(club => (
							<div key={club.id} className="club-card">
								<h3>{club.name}</h3>
								<p>{club.description}</p>
							</div>
						))
					) : (
						<p>You are not a member of any clubs yet</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
