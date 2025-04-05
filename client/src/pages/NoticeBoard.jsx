import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authUtils";
import { db } from "../firebase/config";
import { collection, query, getDocs, addDoc, Timestamp, orderBy } from "firebase/firestore";
import NoticeCard from "../components/NoticeBoard/NoticeCard";
import NoticeForm from "../components/NoticeBoard/NoticeForm";
import "./NoticeBoard.css";

const NoticeBoard = () => {
	const { currentUser, userRoles } = useAuth();
	const [notices, setNotices] = useState([]);
	const [filteredNotices, setFilteredNotices] = useState([]);
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [showAddNoticeForm, setShowAddNoticeForm] = useState(false);
	const [loading, setLoading] = useState(true);

	const isAdmin = userRoles.includes("admin");
	const canPostNotice =
		isAdmin ||
		userRoles.some(role =>
			["acad", "sports", "blithchron", "amalthea", "metis"].includes(role)
		);

	useEffect(() => {
		async function fetchNotices() {
			try {
				const noticesQuery = query(
					collection(db, "noticesCollection"),
					orderBy("createdAt", "desc")
				);
				const noticesSnapshot = await getDocs(noticesQuery);
				const noticesData = noticesSnapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}));

				setNotices(noticesData);
				setFilteredNotices(noticesData);

				// Extract unique categories
				const uniqueCategories = [...new Set(noticesData.map(notice => notice.category))];
				setCategories(uniqueCategories);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching notices:", error);
				setLoading(false);
			}
		}

		fetchNotices();
	}, []);

	useEffect(() => {
		if (selectedCategory === "all") {
			setFilteredNotices(notices);
		} else {
			setFilteredNotices(notices.filter(notice => notice.category === selectedCategory));
		}
	}, [selectedCategory, notices]);

	const handleAddNotice = async noticeData => {
		try {
			const newNotice = {
				title: noticeData.title,
				content: noticeData.content,
				category: noticeData.category,
				postedBy: currentUser.uid,
				createdAt: Timestamp.now(),
				isUrgent: noticeData.isUrgent || false,
			};

			await addDoc(collection(db, "noticesCollection"), newNotice);

			// Refresh notices
			const noticesQuery = query(
				collection(db, "noticesCollection"),
				orderBy("createdAt", "desc")
			);
			const noticesSnapshot = await getDocs(noticesQuery);
			const noticesData = noticesSnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			}));

			setNotices(noticesData);
			setShowAddNoticeForm(false);
		} catch (error) {
			console.error("Error adding notice:", error);
			alert("Failed to add notice. Please try again.");
		}
	};

	if (loading) {
		return <div className="loading">Loading notices...</div>;
	}

	return (
		<div className="noticeboard-container">
			<div className="noticeboard-header">
				<h1>Digital Notice Board</h1>
				{canPostNotice && (
					<button className="add-notice-btn" onClick={() => setShowAddNoticeForm(true)}>
						Post New Notice
					</button>
				)}
			</div>

			<div className="filters">
				<label>
					Filter by Category:
					<select
						value={selectedCategory}
						onChange={e => setSelectedCategory(e.target.value)}
					>
						<option value="all">All Categories</option>
						{categories.map(category => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="notices-list">
				{filteredNotices.length > 0 ? (
					filteredNotices.map(notice => <NoticeCard key={notice.id} notice={notice} />)
				) : (
					<p>No notices found</p>
				)}
			</div>

			{showAddNoticeForm && (
				<div className="modal">
					<div className="modal-content">
						<span className="close" onClick={() => setShowAddNoticeForm(false)}>
							&times;
						</span>
						<NoticeForm onSubmit={handleAddNotice} userRoles={userRoles} />
					</div>
				</div>
			)}
		</div>
	);
};

export default NoticeBoard;
