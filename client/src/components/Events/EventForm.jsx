import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import "./EventForm.css";

const EventForm = ({ onSubmit, userRoles }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [location, setLocation] = useState("");
	const [poster, setPoster] = useState("");
	const [selectedFilters, setSelectedFilters] = useState([]);
	const [selectedClubs, setSelectedClubs] = useState([]);
	const [availableClubs, setAvailableClubs] = useState([]);

	const filterOptions = ["tech", "cult", "sports", "academic", "social", "workshop"];

	useEffect(() => {
		// Fetch available clubs
		async function fetchClubs() {
			try {
				const clubsSnapshot = await getDocs(collection(db, "clubsCollection"));
				const clubsData = clubsSnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}));
				setAvailableClubs(clubsData);

				// Pre-select clubs based on user roles
				const userClubs = clubsData.filter(club => userRoles.includes(club.clubId));
				setSelectedClubs(userClubs.map(club => club.name));
			} catch (error) {
				console.error("Error fetching clubs:", error);
			}
		}

		fetchClubs();
	}, [userRoles]);

	const handleFilterToggle = filter => {
		if (selectedFilters.includes(filter)) {
			setSelectedFilters(selectedFilters.filter(f => f !== filter));
		} else {
			setSelectedFilters([...selectedFilters, filter]);
		}
	};

	const handleClubToggle = clubName => {
		if (selectedClubs.includes(clubName)) {
			setSelectedClubs(selectedClubs.filter(c => c !== clubName));
		} else {
			setSelectedClubs([...selectedClubs, clubName]);
		}
	};

	const handleSubmit = e => {
		e.preventDefault();

		// Validate form
		if (!title || !description || !date || !time || !location) {
			alert("Please fill in all required fields");
			return;
		}

		onSubmit({
			title,
			description,
			date,
			time,
			location,
			poster,
			filters: selectedFilters,
			clubAffiliation: selectedClubs,
		});
	};

	return (
		<form className="event-form" onSubmit={handleSubmit}>
			<h2>Add New Event</h2>

			<div className="form-group">
				<label>Event Title *</label>
				<input
					type="text"
					value={title}
					onChange={e => setTitle(e.target.value)}
					required
				/>
			</div>

			<div className="form-group">
				<label>Description *</label>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					required
				/>
			</div>

			<div className="form-row">
				<div className="form-group">
					<label>Date *</label>
					<input
						type="date"
						value={date}
						onChange={e => setDate(e.target.value)}
						required
					/>
				</div>

				<div className="form-group">
					<label>Time *</label>
					<input
						type="time"
						value={time}
						onChange={e => setTime(e.target.value)}
						required
					/>
				</div>
			</div>

			<div className="form-group">
				<label>Location *</label>
				<input
					type="text"
					value={location}
					onChange={e => setLocation(e.target.value)}
					required
				/>
			</div>

			<div className="form-group">
				<label>Poster URL (Optional)</label>
				<input
					type="url"
					value={poster}
					onChange={e => setPoster(e.target.value)}
					placeholder="https://example.com/poster.jpg"
				/>
			</div>

			<div className="form-group">
				<label>Categories</label>
				<div className="filter-options">
					{filterOptions.map(filter => (
						<div key={filter} className="filter-option">
							<input
								type="checkbox"
								id={`filter-${filter}`}
								checked={selectedFilters.includes(filter)}
								onChange={() => handleFilterToggle(filter)}
							/>
							<label htmlFor={`filter-${filter}`}>{filter}</label>
						</div>
					))}
				</div>
			</div>

			<div className="form-group">
				<label>Associated Clubs</label>
				<div className="club-options">
					{availableClubs.map(club => (
						<div key={club.clubId} className="club-option">
							<input
								type="checkbox"
								id={`club-${club.clubId}`}
								checked={selectedClubs.includes(club.name)}
								onChange={() => handleClubToggle(club.name)}
								disabled={userRoles.includes(club.name)} // Disable if user is coordinator
							/>
							<label htmlFor={`club-${club.clubId}`}>{club.name}</label>
						</div>
					))}
				</div>
			</div>

			<div className="form-actions">
				<button type="submit" className="submit-btn">
					Submit Event
				</button>
			</div>
		</form>
	);
};

export default EventForm;
