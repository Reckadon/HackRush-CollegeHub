import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authUtils";
import "./Navbar.css";

const Navbar = () => {
	const { currentUser, logout } = useAuth();
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
			// Redirect happens automatically via AuthContext
		} catch (error) {
			console.error("Failed to log out:", error);
		}
	};

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<Link to="/" className="navbar-logo">
					CollegeHub
				</Link>

				<div className="menu-icon" onClick={toggleMenu}>
					<i className={menuOpen ? "fas fa-times" : "fas fa-bars"} />
				</div>

				<ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
					<li className="nav-item">
						<Link
							to="/"
							className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
							onClick={() => setMenuOpen(false)}
						>
							Dashboard
						</Link>
					</li>
					<li className="nav-item">
						<Link
							to="/events"
							className={`nav-link ${
								location.pathname === "/events" ? "active" : ""
							}`}
							onClick={() => setMenuOpen(false)}
						>
							Events
						</Link>
					</li>
					<li className="nav-item">
						<Link
							to="/clubs"
							className={`nav-link ${location.pathname === "/clubs" ? "active" : ""}`}
							onClick={() => setMenuOpen(false)}
						>
							Clubs
						</Link>
					</li>
					<li className="nav-item">
						<Link
							to="/notices"
							className={`nav-link ${
								location.pathname === "/notices" ? "active" : ""
							}`}
							onClick={() => setMenuOpen(false)}
						>
							Notices
						</Link>
					</li>
					<li className="nav-item">
						<button className="logout-btn" onClick={handleLogout}>
							Logout
						</button>
					</li>
				</ul>

				<div className="user-profile">
					{currentUser?.photoURL ? (
						<img
							src={currentUser.photoURL}
							alt={currentUser.displayName}
							className="profile-pic"
						/>
					) : (
						<div className="profile-initial">
							{currentUser?.displayName?.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
