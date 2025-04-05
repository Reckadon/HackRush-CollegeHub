import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authUtils";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy } from "firebase/firestore";
import EventCard from "../components/Events/EventCard";
import EventForm from "../components/Events/EventForm";
import "./Events.css";

const Events = () => {
	const { currentUser, userRoles } = useAuth();
	const [events, setEvents] = useState([]);
	const [filteredEvents, setFilteredEvents] = useState([]);
	const [filters, setFilters] = useState([]);
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [showAddEventForm, setShowAddEventForm] = useState(false);
	const [loading, setLoading] = useState(true);

	const isAdmin = userRoles.includes("admin");
	const isClubCoordinator = userRoles.some(role =>
		["blithchron", "amalthea", "metis"].includes(role)
	);

	const fetchEvents = async () => {
		try {
			const now = new Date();
			const eventsQuery = query(
				collection(db, "eventsCollection"),
				where("date", ">=", now),
				where("isActive", "==", true),
				where("isApproved", "==", true),
				orderBy("date")
			);
			const eventsSnapshot = await getDocs(eventsQuery);
			const eventsData = eventsSnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
				date: doc.data().date.toDate ? doc.data().date.toDate() : new Date(doc.data().date),
			}));

			setEvents(eventsData);
			setFilteredEvents(eventsData);

			// Extract unique filters
			const uniqueFilters = [...new Set(eventsData.flatMap(event => event.filters || []))];
			setFilters(uniqueFilters);

			setLoading(false);
		} catch (error) {
			console.error("Error fetching events:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	useEffect(() => {
		if (selectedFilter === "all") {
			setFilteredEvents(events);
		} else {
			setFilteredEvents(
				events.filter(event => event.filters && event.filters.includes(selectedFilter))
			);
		}
	}, [selectedFilter, events]);

	const handleAddEvent = async eventData => {
		console.log(Timestamp.fromDate(new Date(eventData.date)));
		try {
			const newEvent = {
				title: eventData.title,
				description: eventData.description,
				date: Timestamp.fromDate(new Date(eventData.date)),
				time: eventData.time,
				location: eventData.location,
				filters: eventData.filters || [],
				clubAffiliation: eventData.clubAffiliation || [],
				participants: [],
				isActive: true,
				poster: eventData.poster || "",
				postedBy: currentUser.uid,
				createdAt: Timestamp.now(),
				isApproved: isAdmin ? true : false, // Auto-approve if admin
			};

			await addDoc(collection(db, "eventsCollection"), newEvent);
			console.log("Event added successfully:", newEvent);

			// Refresh events if admin (auto-approved)
			if (isAdmin) {
				fetchEvents();
			}

			setShowAddEventForm(false);
			alert(isAdmin ? "Event added successfully!" : "Event submitted for approval!");
		} catch (error) {
			console.error("Error adding event:", error);
			alert("Failed to add event. Please try again.");
		}
	};

	if (loading) {
		return <div className="loading">Loading events...</div>;
	}

	return (
		<div className="events-container">
			<div className="events-header">
				<h1>Campus Events</h1>
				{(isAdmin || isClubCoordinator) && (
					<button className="add-event-btn" onClick={() => setShowAddEventForm(true)}>
						Add New Event
					</button>
				)}
			</div>

			<div className="filters">
				<label>
					Filter by Category:
					<select
						value={selectedFilter}
						onChange={e => setSelectedFilter(e.target.value)}
					>
						<option value="all">All Categories</option>
						{filters.map(filter => (
							<option key={filter} value={filter}>
								{filter}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="events-grid">
				{filteredEvents.length > 0 ? (
					filteredEvents.map(event => <EventCard key={event.id} event={event} />)
				) : (
					<p>No events found</p>
				)}
			</div>

			{showAddEventForm && (
				<div className="modal">
					<div className="modal-content">
						<span className="close" onClick={() => setShowAddEventForm(false)}>
							&times;
						</span>
						<EventForm onSubmit={handleAddEvent} userRoles={userRoles} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Events;
