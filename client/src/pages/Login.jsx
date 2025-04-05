import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const Login = () => {
	const { currentUser, loginWithGoogle } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (currentUser) {
			navigate("/");
		}
	}, [currentUser, navigate]);

	const handleLogin = async () => {
		try {
			await loginWithGoogle();
			// Navigation will happen automatically via the useEffect
		} catch (error) {
			console.error("Failed to login:", error);
			alert("Login failed. Please ensure you're using an IITGN email address.");
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<h1>CollegeHub</h1>
				<p>IITGN's Centralized Campus Communication Platform</p>
				<button className="google-login-btn" onClick={handleLogin}>
					Login with IITGN Google Account
				</button>
			</div>
		</div>
	);
};

export default Login;
