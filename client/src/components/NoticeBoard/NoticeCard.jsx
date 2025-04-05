import React, { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import "./NoticeCard.css";

const NoticeCard = ({ notice }) => {
	const [posterName, setPosterName] = useState("");

	useEffect(() => {
		async function fetchPosterName() {
			try {
				const userRef = doc(db, "users", notice.postedBy);
				const userSnap = await getDoc(userRef);

				if (userSnap.exists()) {
					setPosterName(userSnap.data().displayName);
				}
			} catch (error) {
				console.error("Error fetching poster name:", error);
			}
		}

		fetchPosterName();
	}, [notice.postedBy]);

	const formatDate = timestamp => {
		if (!timestamp) return "";

		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString("en-IN", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<div className={`notice-card ${notice.isUrgent ? "urgent" : ""}`}>
			{notice.isUrgent && <div className="urgent-badge">Urgent</div>}

			<h3 className="notice-title">{notice.title}</h3>
			<p className="notice-content">{notice.content}</p>

			<div className="notice-meta">
				<span className="notice-category">{notice.category}</span>
				<span className="notice-date">Posted on {formatDate(notice.createdAt)}</span>
				<span className="notice-poster">By {posterName}</span>
			</div>
		</div>
	);
};

export default NoticeCard;
