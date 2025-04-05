import React from "react";
import { useAuth } from "../../contexts/authUtils";
import { db } from "../../firebase/config";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import "./EventCard.css";

const EventCard = ({ event , isShort}) => {
	const { currentUser } = useAuth();
	const isRegistered = event.participants && event.participants.includes(currentUser.uid);

	const formatDate = date => {
		return new Date(date).toLocaleDateString("en-IN", {
			weekday: "short",
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const handleRegister = async () => {
		try {
			const userRef = doc(db, "users", currentUser.uid);

			if (isRegistered) {
				// Remove event from user's participation list
				await updateDoc(userRef, {
					participation: arrayRemove(event.id),
				});
			} else {
				// Add event to user's participation list
				await updateDoc(userRef, {
					participation: arrayUnion(event.id),
				});
			}

			// Update UI
			window.location.reload();
		} catch (error) {
			console.error("Error updating registration:", error);
			alert("Failed to update registration. Please try again.");
		}
	};

	const addToCalendar = () => {
		const eventDate = new Date(event.date);
		const eventTime = event.time.split(":");
		eventDate.setHours(eventTime[0], eventTime[1], 0, 0); // Set event time
		const endDate = new Date(eventDate);

		endDate.setHours(endDate.getHours() + 2); // Default 2 hour duration

		const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
			event.title
		)}&dates=${eventDate.toISOString().replace(/-|:|\.\d+/g, "")}/${endDate
			.toISOString()
			.replace(/-|:|\.\d+/g, "")}&details=${encodeURIComponent(
			event.description
		)}&location=${encodeURIComponent(event.location)}`;

		window.open(googleCalendarUrl, "_blank");
	};

	return (
		<div className="event-card">
			{event.poster && (
				<div className="event-poster">
					<img src={event.poster} alt={event.title} />
				</div>
			)}
			<div className="event-content">
				<h3>{event.title}</h3>
				{event.clubAffiliation && (
					<em className="event-club">Organized by: {event.clubAffiliation}</em>
				)}
				<p className="event-date">
					{formatDate(event.date)} • {event.time}
				</p>
				<p className="event-location">{event.location}</p>
				<p className="event-description">{event.description}</p>

				{event.filters && event.filters.length > 0 && (
					<div className="event-tags">
						{event.filters.map(tag => (
							<span key={tag} className="event-tag">
								{tag}
							</span>
						))}
					</div>
				)}

				{!isShort && <div className="event-actions">
					<button
						className={`register-btn ${isRegistered ? "registered" : ""}`}
						onClick={handleRegister}
					>
						{isRegistered ? "Unregister" : "Register"}
					</button>
					<button className="calendar-btn" onClick={addToCalendar}>
						Add to Calendar
					</button>
				</div>}
			</div>
		</div>
	);
};

export default EventCard;
