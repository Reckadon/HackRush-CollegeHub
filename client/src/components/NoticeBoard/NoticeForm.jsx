import React, { useState } from "react";
import "./NoticeForm.css";

const NoticeForm = ({ onSubmit, userRoles }) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [category, setCategory] = useState("general");
	const [isUrgent, setIsUrgent] = useState(false);

	const categoryOptions = [
		"general",
		"academic",
		"sports",
		"cultural",
		"technical",
		"deadlines",
		"announcements",
	];

	// Only admins and academic staff can mark notices as urgent
	const canMarkUrgent = userRoles.includes("admin") || userRoles.includes("acad");

	const handleSubmit = e => {
		e.preventDefault();

		// Validate form
		if (!title || !content) {
			alert("Please fill in all required fields");
			return;
		}

		onSubmit({
			title,
			content,
			category,
			isUrgent: canMarkUrgent ? isUrgent : false,
		});
	};

	return (
		<form className="notice-form" onSubmit={handleSubmit}>
			<h2>Post New Notice</h2>

			<div className="form-group">
				<label>Title *</label>
				<input
					type="text"
					value={title}
					onChange={e => setTitle(e.target.value)}
					required
				/>
			</div>

			<div className="form-group">
				<label>Content *</label>
				<textarea value={content} onChange={e => setContent(e.target.value)} required />
			</div>

			<div className="form-group">
				<label>Category</label>
				<select value={category} onChange={e => setCategory(e.target.value)}>
					{categoryOptions.map(option => (
						<option key={option} value={option}>
							{option.charAt(0).toUpperCase() + option.slice(1)}
						</option>
					))}
				</select>
			</div>

			{canMarkUrgent && (
				<div className="form-group checkbox">
					<input
						type="checkbox"
						id="urgent"
						checked={isUrgent}
						onChange={e => setIsUrgent(e.target.checked)}
					/>
					<label htmlFor="urgent">Mark as Urgent</label>
				</div>
			)}

			<div className="form-actions">
				<button type="submit" className="submit-btn">
					Post Notice
				</button>
			</div>
		</form>
	);
};

export default NoticeForm;
